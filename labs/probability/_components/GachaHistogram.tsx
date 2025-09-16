import React, {useEffect, useMemo, useRef, useState} from 'react';

type Props = {
  // Configuration options
};

export default function GachaHistogram(): JSX.Element {
  const chartRef = useRef<HTMLDivElement | null>(null);
  
  // Parameters
  const [baseProb, setBaseProb] = useState<number>(0.5); // 0.1-10, step 0.1
  const [attempts, setAttempts] = useState<number>(1000); // 1-2000, step 1
  const [numSimulations, setNumSimulations] = useState<number>(200); // 100-10000, step 100
  const [pityAdjust, setPityAdjust] = useState<boolean>(false);
  const [pityPeak, setPityPeak] = useState<number>(80); // 10-100, step 1
  const [pityStart, setPityStart] = useState<number>(70); // 10-100, step 1
  const [bernoulliAdjust, setBernoulliAdjust] = useState<boolean>(false);
  const [bernoulliProb, setBernoulliProb] = useState<number>(50); // 1-100, step 1

  // Monte Carlo simulation results
  const simulationResults = useMemo(() => {
    const results: { name: string; data: number[]; color: string }[] = [];
    
    // Case 1: Base rate only
    const baseResults = runMonteCarloSimulation(
      baseProb / 100, 
      attempts, 
      false, 0, 0, 
      false, 0, 
      numSimulations
    );
    results.push({
      name: 'Base',
      data: baseResults,
      color: '#3498db'
    });
    
    // Case 2: Base + Pity (if enabled)
    if (pityAdjust) {
      const pityResults = runMonteCarloSimulation(
        baseProb / 100, 
        attempts, 
        true, pityStart, pityPeak, 
        false, 0, 
        numSimulations
      );
      results.push({
        name: 'Pity Adjusted',
        data: pityResults,
        color: '#e74c3c'
      });
    }
    
    // Case 3: Base + Pity + Bernoulli (if both enabled)
    if (pityAdjust && bernoulliAdjust) {
      const fullResults = runMonteCarloSimulation(
        baseProb / 100, 
        attempts, 
        true, pityStart, pityPeak, 
        true, bernoulliProb / 100, 
        numSimulations
      );
      results.push({
        name: 'Pity + Bernoulli',
        data: fullResults,
        color: '#2ecc71'
      });
    }
    
    // Case 4: Base + Bernoulli only (if only bernoulli enabled)
    if (!pityAdjust && bernoulliAdjust) {
      const bernoulliResults = runMonteCarloSimulation(
        baseProb / 100, 
        attempts, 
        false, 0, 0, 
        true, bernoulliProb / 100, 
        numSimulations
      );
      results.push({
        name: 'Bernoulli Adjusted',
        data: bernoulliResults,
        color: '#2ecc71'
      });
    }
    
    return results;
  }, [baseProb, attempts, numSimulations, pityAdjust, pityPeak, pityStart, bernoulliAdjust, bernoulliProb]);

  // Generate chart data from Monte Carlo results
  const chartData = useMemo(() => {
    const traces = simulationResults.map(({ name, data, color }) => {
      // Create histogram from Monte Carlo data
      const maxSSR = Math.max(...data);
      const histogram = new Array(maxSSR + 1).fill(0);
      
      // Count occurrences of each SSR count
      data.forEach(ssrCount => {
        histogram[ssrCount]++;
      });
      
      // Convert to probabilities
      const probabilities = histogram.map(count => count / data.length);
      
      return {
        x: histogram.map((_, i) => i),
        y: probabilities,
        type: 'bar' as const,
        name: name,
        marker: { color: color, opacity: 0.4 },
        yaxis: 'y'
      };
    });

    return traces;
  }, [simulationResults]);

  // Render chart
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const plotly = require('plotly.js-dist-min');
    
    const layout = {
      title: {
        text: 'SSR Count Distribution',
        font: { size: 16 }
      },
      xaxis: {
        title: { text: 'Intended SSR Count' },
        type: 'linear'
      },
      yaxis: {
        title: { text: 'Frequency' },
        type: 'linear'
      },
      barmode: 'overlay' as const,
      margin: { t: 60, r: 10, b: 60, l: 50 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: 'rgba(0,0,0,0.2)',
        borderwidth: 1
      }
    };

    plotly.newPlot(chartRef.current, chartData, layout, {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
    });
  }, [chartData]);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Gacha Probability Histogram</h3>
      
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
        {/* Column 1: Base Rate, Attempts, Simulation Count */}
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
          
          <div style={{ marginBottom: '15px' }}>
            <label>Attempts: {attempts}</label>
            <input
              type="range"
              min="100"
              max="5000"
              step="10"
              value={attempts}
              onChange={(e) => setAttempts(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label>Simulation Count: {numSimulations}</label>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={numSimulations}
              onChange={(e) => setNumSimulations(parseInt(e.target.value))}
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
                min="1"
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
      
      {/* Statistics */}
      <div style={{ marginTop: '20px' }}>
        <h4>Statistics</h4>
        {simulationResults.map(({ name, data, color }) => {
          const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
          const variance = data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / data.length;
          return (
            <div key={name} style={{ marginBottom: '10px' }}>
              <span style={{ color, fontWeight: 'bold' }}>{name}:</span>
              <span style={{ marginLeft: '10px' }}>
                Expected SSR: {mean.toFixed(2)}, 
                Variance: {variance.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Create pity probability table
function createPityTable(baseProb: number, pityStart: number, pityPeak: number): number[] {
  const pityP = new Array(pityPeak + 1).fill(0);
  pityP[0] = 0; // Position 0 is always 0
  
  // Base rate for attempts before pity starts
  for (let i = 1; i < pityStart; i++) {
    pityP[i] = baseProb;
  }
  
  // Linear increase from pity start to pity peak
  if (pityStart < pityPeak) {
    for (let i = pityStart; i < pityPeak; i++) {
      const progress = (i - pityStart) / (pityPeak - pityStart);
      pityP[i] = baseProb + progress * (1 - baseProb);
    }
  }
  
  // Hard pity at peak
  pityP[pityPeak] = 1.0;
  
  return pityP;
}

// Monte Carlo simulation function
function runMonteCarloSimulation(
  baseProb: number,
  attempts: number,
  usePity: boolean,
  pityStart: number,
  pityPeak: number,
  useBernoulli: boolean,
  bernoulliProb: number,
  numSimulations: number
): number[] {
  const results: number[] = [];
  
  // Create pity table if pity is enabled
  let pityTable: number[] = [];
  if (usePity) {
    pityTable = createPityTable(baseProb, pityStart, pityPeak);
  }
  
  for (let sim = 0; sim < numSimulations; sim++) {
    let intendedSSRCount = 0;
    let pityCounter = 0;
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      let ssrProb = baseProb;
      
      // Apply pity system if enabled
      if (usePity && pityCounter < pityTable.length) {
        ssrProb = pityTable[pityCounter + 1]; // +1 because pityTable[0] is always 0
      }
      
      // Check if SSR is obtained
      if (Math.random() < ssrProb) {
        // SSR obtained, check if it's intended
        if (!useBernoulli || Math.random() < bernoulliProb) {
          intendedSSRCount++;
        }
        pityCounter = 0; // Reset pity counter
      } else {
        pityCounter++; // Increment pity counter
      }
    }
    
    results.push(intendedSSRCount);
  }
  
  return results;
}
