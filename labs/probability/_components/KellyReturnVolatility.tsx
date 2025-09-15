import React, {useEffect, useMemo, useRef, useState} from 'react';

type Props = {
  odds?: number;        // net odds b
  edge?: number;        // win rate (0-1)
  simulations?: number; // number of simulations for return/volatility analysis
  paths?: number;       // number of simulated paths for Monte Carlo
};

function kellyFraction(p: number, b: number): number {
  const q = 1 - p;
  if (b === 0) return 0;
  return (b * p - q) / b;
}

function simulatePaths(p: number, b: number, f: number, trials: number, paths: number): number[][] {
  const results: number[][] = [];
  for (let k = 0; k < paths; k++) {
    let bankroll = 1;
    const series: number[] = [bankroll];
    for (let t = 0; t < trials; t++) {
      const win = Math.random() < p;
      const change = win ? (1 + f * b) : (1 - f);
      bankroll = Math.max(1e-9, bankroll * change);
      series.push(bankroll);
    }
    results.push(series);
  }
  return results;
}


const shapes = [
  // Kelly < 0.5 → green
  {
    type: 'rect',
    xref: 'x',
    yref: 'paper',
    x0: 0,
    x1: 0.8,
    y0: 0,
    y1: 1,
    fillcolor: 'rgba(46, 204, 113, 0.2)',
    line: {width: 0},
    layer: 'below',
  },
  // 0.5–1.5 → yellow
  {
    type: 'rect',
    xref: 'x',
    yref: 'paper',
    x0: 0.8,
    x1: 1.5,
    y0: 0,
    y1: 1,
    fillcolor: 'rgba(241, 196, 15, 0.2)',
    line: {width: 0},
    layer: 'below',
  },
  // 1.5+ → red
  {
    type: 'rect',
    xref: 'x',
    yref: 'paper',
    x0: 1.5,
    x1: 2,      // or a fixed value like 5
    y0: 0,
    y1: 1,
    fillcolor: 'rgba(231, 76, 60, 0.18)',
    line: {width: 0},
    layer: 'below',
  },
]


function simulateGrowth(p: number, b: number, kellyMultiplier: number, trials: number): { growthRate: number, volatility: number } {
  const kellyF = kellyFraction(p, b);
  const betFraction = Math.max(0, kellyF * kellyMultiplier);
  
  let totalLogGrowth = 0;
  const logGrowths: number[] = [];
  
  for (let i = 0; i < trials; i++) {
    const win = Math.random() < p;
    const change = win ? (1 + betFraction * b) : (1 - betFraction);
    const logGrowth = Math.log(Math.max(1e-9, change));
    totalLogGrowth += logGrowth;
    logGrowths.push(logGrowth);
  }
  
  const avgLogGrowth = totalLogGrowth / trials;
  const variance = logGrowths.reduce((sum, lg) => sum + (lg - avgLogGrowth) ** 2, 0) / trials;
  const volatility = Math.sqrt(variance);
  
  // Convert log growth to approximate return percentage
  const growthRate = (Math.exp(avgLogGrowth) - 1) * 100;
  
  return { growthRate, volatility: volatility * 100 };
}

export default function KellyReturnVolatility({odds = 2.0, edge = 0.55, simulations = 1000, paths = 40}: Props): JSX.Element {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const monteCarloRef = useRef<HTMLDivElement | null>(null);
  const histogramRef = useRef<HTMLDivElement | null>(null);
  const [bState, setBState] = useState<number>(odds);
  const [edgeState, setEdgeState] = useState<number>(edge);
  const [simsState, setSimsState] = useState<number>(simulations);
  const [pathsState, setPathsState] = useState<number>(paths);
  const [seed, setSeed] = useState<number>(0);

  const curves = useMemo(() => {
    const kellyMultipliers = Array.from({length: 21}, (_, i) => i / 10); // 0.0 to 2.0
    const growthRates: number[] = [];
    const volatilities: number[] = [];
    const riskAdjusted: (number | null)[] = [];
    
    kellyMultipliers.forEach(k => {
      const result = simulateGrowth(edgeState, bState, k, simsState);
      growthRates.push(result.growthRate);
      volatilities.push(result.volatility);
      // Sharpe-like metric: return / std (both already in % units)
      riskAdjusted.push(result.volatility > 1e-6 ? result.growthRate / result.volatility : null);
    });
    
    return { kellyMultipliers, growthRates, volatilities, riskAdjusted };
  }, [bState, edgeState, simsState]);

  // Monte Carlo data for 4 Kelly multiplier lines
  const monteCarloData = useMemo(() => {
    const kellyF = kellyFraction(edgeState, bState);
    const kellyMultipliers = [0.25, 0.5, 1.0, 1.5];
    
    // Use 10% of sims for trials, limit paths to 10-50
    const effectiveTrials = 50;
    const effectivePaths = Math.min(Math.max(pathsState, 10), 50);
    
    const x = Array.from({length: effectiveTrials + 1}, (_, i) => i);
    const traces: any[] = [];
    
    kellyMultipliers.forEach((multiplier, idx) => {
      const f = kellyF * multiplier;
      const sims = simulatePaths(edgeState, bState, f, effectiveTrials, effectivePaths);
      const color = ['#ff7f0e', '#2ca02c', '#1f77b4', '#d62728'][idx];
      
      // Calculate average path
      const avgPath = x.map((_, i) => {
        const sum = sims.reduce((acc, series) => acc + series[i], 0);
        return sum / sims.length;
      });
      
      // Combine all individual paths into a single trace (so legend click hides all)
      const allIndividualPaths: number[] = [];
      const allXValues: number[] = [];
      
      sims.forEach((series) => {
        series.forEach((value, i) => {
          allXValues.push(x[i]);
          allIndividualPaths.push(value);
        });
        // Add null values to break lines between paths
        allXValues.push(null);
        allIndividualPaths.push(null);
      });
      
      // Add individual paths as one trace
      traces.push({
        x: allXValues,
        y: allIndividualPaths,
        mode: 'lines',
        line: {width: 0.2, color: color, opacity: 0.15},
        name: `${multiplier}× Kelly (paths)`,
        showlegend: true,
        legendgroup: `kelly-${multiplier}`,
      });
      
      // Add average path (bold)
      traces.push({
        x,
        y: avgPath,
        mode: 'lines',
        line: {width: 5, color: color},
        name: `${multiplier}× Kelly (avg)`,
        showlegend: true,
        legendgroup: `kelly-${multiplier}`,
      });
    });
    
    return traces;
  }, [edgeState, bState, pathsState, seed, simsState]);

  // Histogram data for ending portfolio values
  const histogramData = useMemo(() => {
    const kellyF = kellyFraction(edgeState, bState);
    const kellyMultipliers = [0.25, 0.5, 1.0, 1.5];
    
    // Use same parameters as Monte Carlo
    const effectiveTrials = 100;
    const effectivePaths = Math.min(Math.max(pathsState, 10), 50);
    
    const traces: any[] = [];
    
    kellyMultipliers.forEach((multiplier, idx) => {
      const f = kellyF * multiplier;
      const sims = simulatePaths(edgeState, bState, f, effectiveTrials, effectivePaths);
      const color = ['#ff7f0e', '#2ca02c', '#1f77b4', '#d62728'][idx];
      
      // Extract ending values and transform to log
      const endingValues = sims.map(series => series[series.length - 1]);
      const logEndingValues = endingValues.map(val => Math.log10(Math.max(val, 1e-10)));
      
      // Create histogram
      traces.push({
        x: logEndingValues,
        type: 'histogram',
        name: `${multiplier}× Kelly`,
        marker: {color: color, opacity: 0.4},
        nbinsx: 20,
        histnorm: 'probability density',
      });
    });
    
    return traces;
  }, [edgeState, bState, pathsState, seed, simsState]);

  // Effect for the main Kelly Return/Volatility chart
  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!chartRef.current) return;
      const Plotly = (await import('plotly.js-dist-min')).default as any;
      const data = [
        { x: curves.kellyMultipliers, y: curves.growthRates, name: 'AVG Growth Rate', mode: 'lines', line: {color: 'steelblue'}, yaxis: 'y1' },
        { x: curves.kellyMultipliers, y: curves.volatilities, name: 'AVG Volatility', mode: 'lines', line: {color: 'crimson'}, yaxis: 'y2' },
        { x: curves.kellyMultipliers, y: curves.riskAdjusted, name: 'Return/Volatility', mode: 'lines', line: {color: 'darkgreen', dash: 'dot'}, yaxis: 'y3' },
      ];
      const layout = {
        title: {'text': 'Kelly Multiplier vs Growth Rate & Volatility'},
        xaxis: { 
          title: {'text': 'Kelly Multiplier (K)' },
        },
        yaxis: { 
          title: {'text': 'AVG Return (%)'},
          tickformat: '.1f',
          ticksuffix: '%',
          zeroline: true,
        },
        yaxis2: {
          title: {'text': 'AVG Volatility (%)'},
          overlaying: 'y',
          side: 'right',
          tickformat: '.1f',
          ticksuffix: '%',
          zeroline: false,
        },
        yaxis3: {
          overlaying: 'y',
          side: 'right',
          position: 1.08,
          showticklabels: false,
          ticks: '',
          title: { text: '' },
          zeroline: false,
        },
        shapes: shapes,
        margin: { t: 60, r: 90, b: 60, l: 60 },
      } as any;
      await Plotly.newPlot(chartRef.current, data, layout, {displayModeBar: false});
      if (disposed) Plotly.purge(chartRef.current);
    })();
    return () => { disposed = true; };
  }, [curves]);

  // Effect for the Monte Carlo chart
  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!monteCarloRef.current) return;
      const Plotly = (await import('plotly.js-dist-min')).default as any;
      const layout: any = {
        title: 'Monte Carlo Growth Paths: Different Kelly Multipliers',
        margin: { t: 60, r: 10, b: 60, l: 50 },
        xaxis: { title: {'text': 'Bet counter' } },
        yaxis: { title: {'text': 'Bankroll'}, rangemode: 'tozero', type: 'log' },
        showlegend: true,
      };
      await Plotly.newPlot(monteCarloRef.current, monteCarloData, layout, {displayModeBar: false});
      if (disposed) Plotly.purge(monteCarloRef.current);
    })();
    return () => { disposed = true; };
  }, [monteCarloData]);

  // Effect for the histogram chart
  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!histogramRef.current) return;
      const Plotly = (await import('plotly.js-dist-min')).default as any;
      const layout: any = {
        title: {'text': 'Distribution of Ending Portfolio Values (Log Scale)'},
        margin: { t: 60, r: 10, b: 60, l: 50 },
        xaxis: { 
          title: {'text': 'Log₁₀(Final Portfolio Value)'}, 
          type: 'linear',
          tickformat: '.1f'
        },
        yaxis: { title: {'text': 'Probability Density'} },
        showlegend: true,
        barmode: 'overlay',
        shapes: [
          {
            type: 'line',
            xref: 'x',
            yref: 'paper',
            x0: 0,
            x1: 0,
            y0: 0,
            y1: 1,
            line: {
              color: 'black',
              width: 2,
              dash: 'dash'
            }
          }
        ],
        annotations: [
          {
            x: 0,
            y: 0.95,
            xref: 'x',
            yref: 'paper',
            text: 'Ruin',
            showarrow: false,
            font: { size: 12, color: 'black' },
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: 'black',
            borderwidth: 1
          }
        ]
      };
      await Plotly.newPlot(histogramRef.current, histogramData, layout, {displayModeBar: false});
      if (disposed) Plotly.purge(histogramRef.current);
    })();
    return () => { disposed = true; };
  }, [histogramData]);

  return (
    <div>
      <div style={{display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16}}>
        <label>odds: {bState.toFixed(1)}<input type="range" min={0.8} max={5} step={0.1} value={bState} onChange={e => setBState(Number(e.target.value))} /></label>
        <label>edge: {(edgeState * 100).toFixed(0)}%<input type="range" min={0.40} max={0.99} step={0.01} value={edgeState} onChange={e => setEdgeState(Number(e.target.value))} /></label>
        <label>sims: {simsState}<input type="range" min={100} max={5000} step={100} value={simsState} onChange={e => setSimsState(Number(e.target.value))} /></label>
        <label>paths: {pathsState}<input type="range" min={10} max={100} step={5} value={pathsState} onChange={e => setPathsState(Number(e.target.value))} /></label>
      </div>
      
      <div style={{fontSize: '0.9em', color: '#666', marginBottom: 16}}>
        Monte Carlo uses 50 trials and {Math.min(Math.max(pathsState, 10), 50)} paths
      </div>
      
      <div style={{marginBottom: 32}}>
        <div ref={chartRef} style={{height: 600, width: '100%'}} />
      </div>
      
      <div style={{marginBottom: 32}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
          <h3>Monte Carlo Growth Paths</h3>
          <button onClick={() => setSeed(seed + 1)} style={{padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            New Simulation
          </button>
        </div>
        <div ref={monteCarloRef} style={{height: 500, width: '100%'}} />
      </div>
      
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
          <h3>Ending Portfolio Value Distribution</h3>
          <button onClick={() => setSeed(seed + 1)} style={{padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            New Simulation
          </button>
        </div>
        <div ref={histogramRef} style={{height: 500, width: '100%'}} />
      </div>
    </div>
  );
}


