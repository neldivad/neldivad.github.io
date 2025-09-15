import React, {useEffect, useMemo, useRef, useState} from 'react';

function kellyFraction(p: number, b: number): number {
  const q = 1 - p;
  if (b === 0) return 0;
  return (b * p - q) / b;
}

type Props = {
  pSteps?: number;
  bSteps?: number;
  maxOdds?: number;
  kellyMultiplier?: number;
};

export default function KellyHeatmap({pSteps = 21, bSteps = 21, maxOdds = 20, kellyMultiplier = 1.0}: Props): JSX.Element {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [maxOddsState, setMaxOddsState] = useState<number>(maxOdds);
  const [pStepsState, setPStepsState] = useState<number>(pSteps);
  const [bStepsState, setBStepsState] = useState<number>(bSteps);
  const [kellyMultiplierState, setKellyMultiplierState] = useState<number>(kellyMultiplier);

  const grid = useMemo(() => {
    const pVals = Array.from({length: pStepsState}, (_, i) => (i / (pStepsState - 1)) * 100); // 0-100%
    const bVals = Array.from({length: bStepsState}, (_, i) => (i / (bStepsState - 1)) * maxOddsState);
    const z: number[][] = bVals.map(() => Array(pVals.length).fill(0));
    for (let bi = 0; bi < bVals.length; bi++) {
      for (let pi = 0; pi < pVals.length; pi++) {
        const p = pVals[pi] / 100; // Convert back to 0-1 for calculation
        const f = Math.max(0, kellyFraction(p, bVals[bi]));
        z[bi][pi] = Math.min(1, f * kellyMultiplierState) * 100; // Apply Kelly multiplier and convert to 0-100%
      }
    }
    return {pVals, bVals, z};
  }, [pStepsState, bStepsState, maxOddsState, kellyMultiplierState]);

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!chartRef.current) return;
      const Plotly = (await import('plotly.js-dist-min')).default as any;
      const data = [{
        x: grid.pVals,
        y: grid.bVals,
        z: grid.z,
        type: 'heatmap',
        colorscale: 'Viridis',
        reversescale: false,
        zmin: 0,
        zmax: 100,
        colorbar: { 
          title: 'Bet size (%)',
          tickformat: '.0f',
          ticksuffix: '%'
        },
      }];
       var layout: any = {
         title: {'text': '<b>Kelly Bet Size</b>', 'font': { 'size': 14 }},
         xaxis: { 
           title: {'text': 'Assumed probability (%)', 'font': { 'size': 12 }},
           tickformat: '.0f',
           ticksuffix: '%'
         },
         yaxis: { title: {'text': 'Winnings multiplier', 'font': { 'size': 12 }}, },
         zaxis: { title: {'text': 'Bet size', 'font': { 'size': 12 }}, },
         margin: { t: 60, r: 10, b: 60, l: 60 },
       };
      await Plotly.newPlot(chartRef.current, data, layout, {displayModeBar: false});
      if (disposed) Plotly.purge(chartRef.current);
    })();
    return () => { disposed = true; };
  }, [grid]);

  return (
    <div>
      <div style={{display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 1fr)'}}>
        <label>max odds: {maxOddsState.toFixed(0)}<input type="range" min={5} max={50} step={1} value={maxOddsState} onChange={e => setMaxOddsState(Number(e.target.value))} /></label>
        <label>p steps: {pStepsState}<input type="range" min={11} max={101} step={2} value={pStepsState} onChange={e => setPStepsState(Number(e.target.value))} /></label>
        <label>odds steps: {bStepsState}<input type="range" min={11} max={51} step={2} value={bStepsState} onChange={e => setBStepsState(Number(e.target.value))} /></label>
        <label>Kelly K: {kellyMultiplierState.toFixed(1)}<input type="range" min={0.1} max={2.0} step={0.1} value={kellyMultiplierState} onChange={e => setKellyMultiplierState(Number(e.target.value))} /></label>
      </div>
      <div ref={chartRef} style={{height: 600, width: '100%'}} />
    </div>
  );
}


