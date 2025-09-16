import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  // Configuration options
};

export default function ABTestCalculator(): JSX.Element {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const histogramRef = useRef<HTMLDivElement | null>(null);
  
  // Parameters
  const [baseEffect, setBaseEffect] = useState<number>(20); // 1-100, step 1 (base conversion rate %)
  const [baseStd, setBaseStd] = useState<number>(20); // 10-200, step 1 (std as % of base effect)
  const [targetEffect, setTargetEffect] = useState<number>(30); // 1-100, step 1 (target conversion rate %)
  const [targetStd, setTargetStd] = useState<number>(20); // 10-200, step 1 (std as % of target effect)

  // Simulate trial progression with realistic variance
  const simulateTrialProgression = (
    baseEffect: number,
    baseStd: number,
    targetEffect: number,
    targetStd: number
  ): { trials: number[], logP: number[], oddsRatio: number[] } => {
    const trials: number[] = [];
    const logP: number[] = [];
    const oddsRatio: number[] = [];
    
    // Running totals for chi-square test
    let aSuccesses = 0;
    let aFailures = 0;
    let bSuccesses = 0;
    let bFailures = 0;
    
    // Simulate up to 1000 trials
    for (let n = 1; n <= 500; n++) {
      // Convert percentages to decimals and calculate std as multiplier
      const baseRate = baseEffect / 100;
      const targetRate = targetEffect / 100;
      const baseStdMultiplier = baseStd / 100; // 20% = 0.2
      const targetStdMultiplier = targetStd / 100; // 20% = 0.2
      
      // Simulate one observation for each group with variance (multiplicative)
      const aObservedRate = Math.max(0, Math.min(1, 
        baseRate * (1 + (Math.random() - 0.5) * baseStdMultiplier * 2)
      ));
      const bObservedRate = Math.max(0, Math.min(1, 
        targetRate * (1 + (Math.random() - 0.5) * targetStdMultiplier * 2)
      ));
      
      // Convert to binary outcomes (success/failure)
      const aSuccess = Math.random() < aObservedRate ? 1 : 0;
      const bSuccess = Math.random() < bObservedRate ? 1 : 0;
      
      // Update running totals
      aSuccesses += aSuccess;
      aFailures += (1 - aSuccess);
      bSuccesses += bSuccess;
      bFailures += (1 - bSuccess);
      
      // Calculate p-value using chi-square test
      const pValue = calculateChiSquarePValue(aSuccesses, aFailures, bSuccesses, bFailures);
      
      // Calculate odds ratio
      const oddsRatioValue = calculateOddsRatio(aSuccesses, aFailures, bSuccesses, bFailures);
      
      trials.push(n);
      logP.push(Math.log10(pValue));
      oddsRatio.push(oddsRatioValue);
    }
    
    return { trials, logP, oddsRatio };
  };

  // Calculate p-value using chi-square test
  const calculateChiSquarePValue = (
    aSuccesses: number, aFailures: number,
    bSuccesses: number, bFailures: number
  ): number => {
    const totalA = aSuccesses + aFailures;
    const totalB = bSuccesses + bFailures;
    const totalSuccesses = aSuccesses + bSuccesses;
    const totalFailures = aFailures + bFailures;
    const grandTotal = totalA + totalB;
    
    if (totalA === 0 || totalB === 0 || totalSuccesses === 0 || totalFailures === 0) {
      return 1.0; // No data or all same outcome
    }
    
    // Expected frequencies
    const expectedASuccesses = (totalA * totalSuccesses) / grandTotal;
    const expectedAFailures = (totalA * totalFailures) / grandTotal;
    const expectedBSuccesses = (totalB * totalSuccesses) / grandTotal;
    const expectedBFailures = (totalB * totalFailures) / grandTotal;
    
    // Chi-square statistic
    const chiSquare = 
      Math.pow(aSuccesses - expectedASuccesses, 2) / expectedASuccesses +
      Math.pow(aFailures - expectedAFailures, 2) / expectedAFailures +
      Math.pow(bSuccesses - expectedBSuccesses, 2) / expectedBSuccesses +
      Math.pow(bFailures - expectedBFailures, 2) / expectedBFailures;
    
    // Approximate p-value (simplified)
    // For df=1, chi-square > 3.84 corresponds to p < 0.05
    if (chiSquare < 0.1) return 1.0;
    if (chiSquare > 10) return 0.001;
    
    // Rough approximation
    return Math.max(0.001, Math.exp(-chiSquare / 2));
  };

  // Calculate odds ratio
  const calculateOddsRatio = (
    aSuccesses: number, aFailures: number,
    bSuccesses: number, bFailures: number
  ): number => {
    if (aSuccesses === 0 || bFailures === 0) return 0;
    if (aFailures === 0 || bSuccesses === 0) return Infinity;
    
    return (bSuccesses * aFailures) / (aSuccesses * bFailures);
  };

  // Calculate doubt index and adjusted significance
  const calculateDoubtIndex = (trialNumber: number, pValue: number): number => {
    // Much more conservative doubt index
    // Early trials require extremely strict thresholds
    if (trialNumber < 10) return 0.01; // p < 0.001 for first 10 trials
    if (trialNumber < 25) return 0.02;  // p < 0.01 for trials 10-25
    if (trialNumber < 50) return 0.03;  // p < 0.02 for trials 25-50
    if (trialNumber < 100) return 0.04; // p < 0.03 for trials 50-100
    
    // Only after 100 trials do we use standard threshold
    return 0.05;
  };

  // Generate simulation data once
  const simulationData = useMemo(() => {
    return simulateTrialProgression(baseEffect, baseStd, targetEffect, targetStd);
  }, [baseEffect, baseStd, targetEffect, targetStd]);

  // Generate Monte Carlo distribution of trials to significance
  const monteCarloData = useMemo(() => {
    const numSimulations = 100; // Run 100 simulations
    const trialsToSignificance: number[] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const result = simulateTrialProgression(baseEffect, baseStd, targetEffect, targetStd);
      
      // Find where p-value crosses the doubt-adjusted threshold
      let requiredTrials = null;
      let sustainedSignificance = 0;
      
      for (let i = 0; i < result.trials.length; i++) {
        const pValue = Math.pow(10, result.logP[i]);
        const adjustedThreshold = calculateDoubtIndex(result.trials[i], pValue);
        
        if (pValue <= adjustedThreshold) {
          sustainedSignificance++;
          if (sustainedSignificance >= 10) {
            requiredTrials = result.trials[i];
            break;
          }
        } else {
          sustainedSignificance = 0;
        }
      }
      
      if (requiredTrials) {
        trialsToSignificance.push(requiredTrials);
      }
    }
    
    return trialsToSignificance;
  }, [baseEffect, baseStd, targetEffect, targetStd]);





  
  // Generate chart data
  const chartData = useMemo(() => {
    const traces = [
      {
        x: simulationData.trials,
        y: simulationData.logP,
        type: 'scatter',
        mode: 'lines',
        name: '-Log₁₀(p-value)',
        line: { color: '#3498db', width: 2 },
        hovertemplate: 'Trials: %{x}<br>-Log₁₀(p-value): %{y:.3f}<extra></extra>',
        yaxis: 'y'
      },
      {
        x: simulationData.trials,
        y: simulationData.oddsRatio,
        type: 'scatter',
        mode: 'lines',
        name: 'Odds Ratio',
        line: { color: '#e74c3c', width: 2 },
        hovertemplate: 'Trials: %{x}<br>Odds Ratio: %{y:.3f}<extra></extra>',
        yaxis: 'y2'
      }
    ];
    
    // Add doubt-adjusted threshold curve
    const doubtThresholdX = [];
    const doubtThresholdY = [];
    for (let i = 0; i < simulationData.trials.length; i++) {
      const trial = simulationData.trials[i];
      const adjustedThreshold = calculateDoubtIndex(trial, 0.05);
      doubtThresholdX.push(trial);
      doubtThresholdY.push(Math.log10(adjustedThreshold));
    }
    
    traces.push({
      x: doubtThresholdX,
      y: doubtThresholdY,
      type: 'scatter',
      mode: 'lines',
      name: 'Doubt-Adjusted Threshold',
      line: { color: '#e67e22', width: 2, dash: 'dot' } as any,
      hovertemplate: 'Trials: %{x}<br>Adjusted Threshold: %{y:.3f}<extra></extra>',
      yaxis: 'y'
    });
    
    return traces;
  }, [simulationData]);

  // Render chart
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const plotly = require('plotly.js-dist-min');
    
     const layout = {
       title: {
         text: 'Trial Progression: P-value and Odds Ratio Evolution',
         font: { size: 16 }
       },
       xaxis: {
         title: { text: 'Number of Trials' },
         type: 'linear'
       },
       yaxis: {
         title: { text: '-Log₁₀(p-value)' },
         type: 'linear',
         side: 'left'
       },
       yaxis2: {
         title: { text: 'Odds Ratio' },
         type: 'linear',
         side: 'right',
         overlaying: 'y'
       },
      margin: { t: 60, r: 50, b: 60, l: 50 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: 'rgba(0,0,0,0.2)',
        borderwidth: 1
      },
      shapes: [
        // Significance region (below p=0.05)
        {
          type: 'rect',
          xref: 'paper',
          yref: 'y',
          x0: 0,
          x1: 1,
          y0: -3,
          y1: -1.3,
          fillcolor: 'rgba(46, 204, 113, 0.1)',
          line: { width: 0 },
          layer: 'below'
        }
      ],
      annotations: [
        {
          x: 0.9,
          y: -1.65,
          xref: 'paper',
          yref: 'y',
          text: 'Significant Region',
          showarrow: false,
          font: { size: 12, color: 'rgba(46, 204, 113, 0.8)' },
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          bordercolor: 'rgba(46, 204, 113, 0.3)',
          borderwidth: 1
        }
      ]
    };

    plotly.newPlot(chartRef.current, chartData, layout, {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
    });
  }, [chartData]);

  // Render histogram
  useEffect(() => {
    if (!histogramRef.current || monteCarloData.length === 0) return;

    const plotly = require('plotly.js-dist-min');
    
    const histogramData = [{
      x: monteCarloData,
      type: 'histogram',
      name: 'Trials to Significance',
      marker: { color: '#3498db', opacity: 0.7 },
      nbinsx: 50,
      histnorm: 'probability density'
    }];
    
    const histogramLayout = {
      title: {
        text: `Distribution of Trials to Significance (${monteCarloData.length} simulations)`,
        font: { size: 16 }
      },
      xaxis: {
        title: { text: 'Trials to Significance' },
        type: 'linear'
      },
      margin: { t: 60, r: 50, b: 60, l: 50 },
      showlegend: false,
      height: 500,
    };
    
    plotly.newPlot(histogramRef.current, histogramData, histogramLayout, {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
    });
  }, [monteCarloData]);



  // Calculate key statistics
  const keyStats = useMemo(() => {
    // Calculate Monte Carlo statistics
    const meanTrials = monteCarloData.length > 0 
      ? monteCarloData.reduce((sum, trials) => sum + trials, 0) / monteCarloData.length 
      : null;
    
    const medianTrials = monteCarloData.length > 0 
      ? [...monteCarloData].sort((a, b) => a - b)[Math.floor(monteCarloData.length / 2)]
      : null;
    
    const minTrials = monteCarloData.length > 0 ? Math.min(...monteCarloData) : null;
    const maxTrials = monteCarloData.length > 0 ? Math.max(...monteCarloData) : null;
    
    // Calculate true odds ratio (convert percentages to decimals)
    const baseRate = baseEffect / 100;
    const targetRate = targetEffect / 100;
    
    return {
      meanTrials,
      medianTrials,
      minTrials,
      maxTrials,
      numSimulations: monteCarloData.length,
      baseRate: baseEffect,
      targetRate: targetEffect,
      improvement: ((targetEffect - baseEffect) / baseEffect) * 100
    };
  }, [monteCarloData, baseEffect, targetEffect]);

  return (
    <div style={{ padding: '20px' }}>
      <h3>A/B Test Statistical Significance Calculator</h3>
      
      {/* Parameters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '20px',
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '8px'
      }}>
        {/* Control Group (A) */}
        <div>
          <h4>Control Group (A)</h4>
          <div style={{ marginBottom: '15px' }}>
            <label>Base Effect: {baseEffect}%</label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={baseEffect}
              onChange={(e) => setBaseEffect(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <small>True conversion rate for control group</small>
          </div>
          <div>
            <label>Base Std: {baseStd}%</label>
            <input
              type="range"
              min="10"
              max="200"
              step="1"
              value={baseStd}
              onChange={(e) => setBaseStd(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <small>Standard deviation as % of base effect (multiplicative)</small>
          </div>
        </div>
        
        {/* Treatment Group (B) */}
        <div>
          <h4>Treatment Group (B)</h4>
          <div style={{ marginBottom: '15px' }}>
            <label>Target Effect: {targetEffect}%</label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={targetEffect}
              onChange={(e) => setTargetEffect(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <small>True conversion rate for treatment group</small>
          </div>
          <div>
            <label>Target Std: {targetStd}%</label>
            <input
              type="range"
              min="10"
              max="200"
              step="1"
              value={targetStd}
              onChange={(e) => setTargetStd(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <small>Standard deviation as % of target effect (multiplicative)</small>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
      
      {/* Monte Carlo Histogram */}
      <div style={{ marginTop: '20px' }}>
        <h4>Monte Carlo Distribution: Trials to Significance</h4>
        <div ref={histogramRef} style={{ width: '100%', height: '500px' }} />
      </div>
      
      {/* Key Statistics */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>
        <h4>Key Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <p><strong>Control (A):</strong> {keyStats.baseRate}% ± {baseStd * keyStats.baseRate / 100}%</p>
            <p><strong>Treatment (B):</strong> {keyStats.targetRate}% ± {targetStd * keyStats.targetRate / 100}%</p>
            <p><strong>True Improvement:</strong> {keyStats.improvement.toFixed(1)}%</p>
          </div>
          <div>
            <p><strong>Mean Trials:</strong> {keyStats.meanTrials ? keyStats.meanTrials.toFixed(0) : 'N/A'}</p>
            <p><strong>Median Trials:</strong> {keyStats.medianTrials ? keyStats.medianTrials.toFixed(0) : 'N/A'}</p>
            <p><strong>Range:</strong> {keyStats.minTrials ? keyStats.minTrials.toFixed(0) : 'N/A'} - {keyStats.maxTrials ? keyStats.maxTrials.toFixed(0) : 'N/A'}</p>
            <p><strong>Simulations:</strong> {keyStats.numSimulations}</p>
          </div>
        </div>
      </div>
      
      {/* Information */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>
        <h4>How to Read This Chart</h4>
        <p>
          <strong>Doubt Index:</strong> Early significance is heavily discounted due to the "luck factor." The doubt-adjusted threshold 
          starts extremely strict (requiring p &lt; 0.01 for first 10 trials) and gradually relaxes to standard (p &lt; 0.05) after 100 trials. 
          Significance is only confirmed after 10 consecutive trials below the adjusted threshold.
        </p>
        <p>
          <strong>Monte Carlo Simulation:</strong> The histogram shows the distribution of trials needed to reach significance across 100 
          independent simulation runs. This reveals the variability in how long it takes to detect the true effect, accounting for 
          the randomness inherent in real A/B tests.
        </p>
        <p>
          <strong>Interpretation:</strong> The top chart shows one example simulation run, while the histogram shows the full distribution. 
          High variance makes it harder to detect true effects, requiring more trials for significance.
        </p>
      </div>
    </div>
  );
}
