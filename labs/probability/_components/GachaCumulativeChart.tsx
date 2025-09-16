import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  // Configuration options
};

export default function GachaCumulativeChart(): JSX.Element {
  const chartRef = useRef<HTMLDivElement | null>(null);
  
  // Parameters
  const [baseProb, setBaseProb] = useState<number>(0.5); // 0-100, step 0.1
  const [targetCopies, setTargetCopies] = useState<number>(1); // 1-20, step 1
  const [pityAdjust, setPityAdjust] = useState<boolean>(false);
  const [pityPeak, setPityPeak] = useState<number>(90); // 10-100, step 1
  const [pityStart, setPityStart] = useState<number>(75); // 10-100, step 1
  const [bernoulliAdjust, setBernoulliAdjust] = useState<boolean>(false);
  const [bernoulliProb, setBernoulliProb] = useState<number>(50); // 10-100, step 1

  // Create pity probability table
  const createPityTable = (baseProb: number, pityStart: number, pityPeak: number): number[] => {
    const pityP = new Array(pityPeak + 1).fill(0);
    pityP[0] = 0; // Position 0 is always 0
    
    // Base rate for attempts before pity starts
    for (let i = 1; i < pityStart; i++) {
      pityP[i] = baseProb / 100;
    }
    
    // Linear increase from pity start to pity peak
    if (pityStart < pityPeak) {
      for (let i = pityStart; i < pityPeak; i++) {
        const progress = (i - pityStart) / (pityPeak - pityStart);
        pityP[i] = (baseProb / 100) + progress * (1 - baseProb / 100);
      }
    }
    
    // Hard pity at peak
    pityP[pityPeak] = 1.0;
    
    return pityP;
  };

  // Calculate cumulative probability for getting target copies
  const calculateCumulativeProbability = (
    baseProb: number,
    targetCopies: number,
    usePity: boolean,
    pityStart: number,
    pityPeak: number,
    useBernoulli: boolean,
    bernoulliProb: number
  ): { attempts: number[], cumulativeProb: number[], markers: { prob: number, attempts: number }[] } => {
    const attempts: number[] = [];
    const cumulativeProb: number[] = [];
    
    // Create pity table if pity is enabled
    let pityTable: number[] = [];
    if (usePity) {
      pityTable = createPityTable(baseProb, pityStart, pityPeak);
    }
    
    // Monte Carlo simulation - run until we reach 99% probability
    const numSimulations = 30;
    const targetProbabilities = [0.25, 0.50, 0.75, 0.90];
    const markers: { prob: number, attempts: number }[] = [];
    
    let attemptCount = 1;
    let foundMarkers = new Set<number>();
    
    while (attemptCount <= 2000) { // Safety limit
      let successCount = 0;
      
      for (let sim = 0; sim < numSimulations; sim++) {
        let intendedSSRCount = 0;
        let pityCounter = 0;
        
        for (let attempt = 1; attempt <= attemptCount; attempt++) {
          let ssrProb = baseProb / 100;
          
          // Apply pity system if enabled
          if (usePity && pityCounter < pityTable.length) {
            ssrProb = pityTable[pityCounter + 1]; // +1 because pityTable[0] is always 0
          }
          
          // Check if SSR is obtained
          if (Math.random() < ssrProb) {
            // SSR obtained, check if it's intended
            if (!useBernoulli || Math.random() < bernoulliProb / 100) {
              intendedSSRCount++;
            }
            pityCounter = 0; // Reset pity counter
          } else {
            pityCounter++; // Increment pity counter
          }
        }
        
        // Check if we got enough copies
        if (intendedSSRCount >= targetCopies) {
          successCount++;
        }
      }
      
      const currentProb = successCount / numSimulations;
      attempts.push(attemptCount);
      cumulativeProb.push(currentProb);
      
      // Check for target probability markers
      for (const targetProb of targetProbabilities) {
        if (!foundMarkers.has(targetProb) && currentProb >= targetProb) {
          markers.push({ prob: targetProb, attempts: attemptCount });
          foundMarkers.add(targetProb);
        }
      }
      
      // Stop when we reach 95% probability
      if (currentProb >= 0.95) {
        break;
      }
      
      attemptCount += 5; // Step by 5 attempts
    }
    
    return { attempts, cumulativeProb, markers };
  };

  // Generate chart data
  const chartData = useMemo(() => {
    const traces = [];
    const allMarkers: { prob: number, attempts: number, name: string, color: string }[] = [];
    
    // Case 1: Base rate only
    const baseResult = calculateCumulativeProbability(
      baseProb, targetCopies, false, 0, 0, false, 0
    );
    traces.push({
      x: baseResult.attempts,
      y: baseResult.cumulativeProb,
      type: 'scatter',
      mode: 'lines',
      name: 'Base',
      line: { color: '#3498db', width: 1 },
      hovertemplate: '%{x}'
    });
    
    // Add markers for base
    baseResult.markers.forEach(marker => {
      allMarkers.push({ ...marker, name: 'Base', color: '#3498db' });
    });
    
    // Case 2: Base + Pity (if enabled)
    if (pityAdjust) {
      const pityResult = calculateCumulativeProbability(
        baseProb, targetCopies, true, pityStart, pityPeak, false, 0
      );
      traces.push({
        x: pityResult.attempts,
        y: pityResult.cumulativeProb,
        type: 'scatter',
        mode: 'lines',
        name: 'Pity Adjusted',
        line: { color: '#e74c3c', width: 1 },
        hovertemplate: '%{x}'
      });
      
      // Add markers for pity
      pityResult.markers.forEach(marker => {
        allMarkers.push({ ...marker, name: 'Pity Adjusted', color: '#e74c3c' });
      });
    }
    
    // Case 3: Base + Pity + Bernoulli (if both enabled)
    if (pityAdjust && bernoulliAdjust) {
      const fullResult = calculateCumulativeProbability(
        baseProb, targetCopies, true, pityStart, pityPeak, true, bernoulliProb
      );
      traces.push({
        x: fullResult.attempts,
        y: fullResult.cumulativeProb,
        type: 'scatter',
        mode: 'lines',
        name: 'Pity + Bernoulli',
        line: { color: '#2ecc71', width: 1 },
        hovertemplate: '%{x}'
      });
      
      // Add markers for full system
      fullResult.markers.forEach(marker => {
        allMarkers.push({ ...marker, name: 'Pity + Bernoulli', color: '#2ecc71' });
      });
    }
    
    // Store markers for use in layout
    (traces as any).markers = allMarkers;
    
    return traces;
  }, [baseProb, targetCopies, pityAdjust, pityStart, pityPeak, bernoulliAdjust, bernoulliProb]);

  // Render chart
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const plotly = require('plotly.js-dist-min');
    
    // Create background shapes for probability markers
    const shapes = [];
    const annotations = [];
    
    // Get all markers from chart data
    const allMarkers = (chartData as any).markers || [];
    
    // Group markers by probability level
    const markerGroups = allMarkers.reduce((groups, marker) => {
      const key = `${marker.prob * 100}%`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(marker);
      return groups;
    }, {} as Record<string, typeof allMarkers>);
    
    // Create horizontal lines for each probability level
    Object.entries(markerGroups).forEach(([probLabel, markers]) => {
      const prob = markers[0].prob;

      
      // Add horizontal line shape
      shapes.push({
        type: 'line',
        // x0: minAttempts,
        // x1: maxAttempts,
        y0: prob,
        y1: prob,
        line: {
          color: 'rgba(128, 128, 128, 0.3)',
          width: 1,
          dash: 'dot'
        },
        layer: 'below'
      });
      
      // Add annotation for probability level
      annotations.push({
        y: prob,
        text: probLabel,
        showarrow: false,
        font: { size: 10, color: 'rgba(19, 18, 18, 0.8)' },
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: 'rgba(128, 128, 128, 0.3)',
        borderwidth: 1,
        xanchor: 'right',
        yanchor: 'middle'
      });
    });
    
     const layout = {
       title: {
         text: `Cumulative Probability vs Attempts (Target: ${targetCopies} copies)`,
         font: { size: 16 }
       },
       xaxis: {
         title: { text: 'Attempts' },
         type: 'linear'
       },
       yaxis: {
         title: { text: 'Cumulative Probability' },
         type: 'linear',
         range: [0, 1],
         showticklabels: false
       },
      margin: { t: 60, r: 10, b: 60, l: 50 },
      hovermode: 'y unified',
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: 'rgba(0,0,0,0.2)',
        borderwidth: 1
      },
      shapes: shapes,
      annotations: annotations
    };

    plotly.newPlot(chartRef.current, chartData, layout, {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
    });
  }, [chartData, targetCopies]);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Gacha Cumulative Probability Chart</h3>
      
      {/* Parameters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px',
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}>
        {/* Column 1: Base Rate, Target Copies */}
        <div>
          <h4>Basic Parameters</h4>
          <div style={{ marginBottom: '15px' }}>
            <label>Base Probability (%): {baseProb}%</label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={baseProb}
              onChange={(e) => setBaseProb(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label>Target Copies: {targetCopies}</label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={targetCopies}
              onChange={(e) => setTargetCopies(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        {/* Column 2: Pity Adjust, Pity Peak, Pity Start */}
        <div>
          <h4>Pity System</h4>
          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={pityAdjust}
                onChange={(e) => setPityAdjust(e.target.checked)}
              />
              Pity Adjust
            </label>
          </div>
          
          {pityAdjust && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label>Pity Peak: {pityPeak}</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={pityPeak}
                  onChange={(e) => {
                    const newPeak = parseInt(e.target.value);
                    setPityPeak(newPeak);
                    if (newPeak < pityStart) {
                      setPityStart(newPeak);
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label>Pity Start: {pityStart}</label>
                <input
                  type="range"
                  min="10"
                  max={pityPeak}
                  step="1"
                  value={pityStart}
                  onChange={(e) => {
                    const newStart = parseInt(e.target.value);
                    setPityStart(newStart);
                    if (newStart > pityPeak) {
                      setPityPeak(newStart);
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Column 3: Bernoulli Adjust, Bernoulli Probability */}
        <div>
          <h4>Bernoulli System</h4>
          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={bernoulliAdjust}
                onChange={(e) => setBernoulliAdjust(e.target.checked)}
              />
              Bernoulli Adjust
            </label>
          </div>
          
          {bernoulliAdjust && (
            <div>
              <label>Bernoulli Probability (%): {bernoulliProb}%</label>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={bernoulliProb}
                onChange={(e) => setBernoulliProb(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Chart */}
      <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
      
      {/* Information */}
      <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px' }}>
        <h4>Chart Information</h4>
        <p>
          This chart shows the required amount of attempts to reach a cumulative probability of obtaining <strong>{targetCopies} target copies</strong> of a limited character <strong>you intend</strong> to pull. Each line represents a different gacha system configuration:
        </p>
        <ul>
          <li><strong>Base:</strong> Standard gacha with {baseProb}% base rate</li>
          {pityAdjust && (
            <li><strong>Pity Adjusted:</strong> Includes pity system (starts at {pityStart}, peaks at {pityPeak})</li>
          )}
          {pityAdjust && bernoulliAdjust && (
            <li><strong>Pity + Bernoulli:</strong> Full system with pity and {bernoulliProb}% bernoulli probability</li>
          )}
        </ul>
      </div>
    </div>
  );
}
