import React, { useEffect, useMemo, useRef, useState } from 'react';

import { pk2 as pk2Raw, pk3 as pk3Raw, pk4 as pk4Raw } from '../_data/preflop';

type DatasetKey = '2p' | '3p' | '4p';

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

function getKey(r1: string, r2: string, i: number, j: number): string {
  if (i === j) return `${r1}${r2}p`;
  // Normalize order in key to high rank first, matching dict (e.g., 'AKs', 'AQo')
  const highIdx = Math.min(i, j); // smaller index => higher rank (A highest)
  const lowIdx = Math.max(i, j);
  const high = RANKS[highIdx];
  const low = RANKS[lowIdx];
  // Upper triangle (i < j) -> suited, lower triangle -> offsuit
  return `${high}${low}${i < j ? 's' : 'o'}`;
}

function prettyName(key: string): string {
  const rank1 = key[0];
  const rank2 = key[1];
  const suffix = key[2];
  if (suffix === 'p') return `${rank1}${rank2} pair`;
  if (suffix === 's') return `${rank1}${rank2} suited`;
  if (suffix === 'o') return `${rank1}${rank2} unsuited`;
  return `${rank1}${rank2}`;
}

function normalizeValue(val: number, dataset: DatasetKey): number {
  // pk2 provided as 0-1, pk3/pk4 provided as 0-100
  if (dataset === '2p') return Math.max(0, Math.min(100, val * 100));
  return Math.max(0, Math.min(100, val));
}

export default function PokerPreFlopMap(): JSX.Element {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [dataset, setDataset] = useState<DatasetKey>('2p');
  const [showEr, setShowEr] = useState<boolean>(false);

  const dict = useMemo(() => {
    if (dataset === '2p') return pk2Raw as Record<string, number>;
    if (dataset === '3p') return pk3Raw as Record<string, number>;
    return pk4Raw as Record<string, number>;
  }, [dataset]);

  const grid = useMemo(() => {
    const zEquity: number[][] = Array.from({ length: RANKS.length }, () => Array(RANKS.length).fill(0));
    const zEr: number[][] = Array.from({ length: RANKS.length }, () => Array(RANKS.length).fill(0));
    const nameText: string[][] = Array.from({ length: RANKS.length }, () => Array(RANKS.length).fill(''));
    const players = dataset === '2p' ? 2 : dataset === '3p' ? 3 : 4;
    const baseline = 1 / players;
    for (let i = 0; i < RANKS.length; i++) {
      for (let j = 0; j < RANKS.length; j++) {
        const r1 = RANKS[i];
        const r2 = RANKS[j];
        const key = getKey(r1, r2, i, j);
        const raw = dict[key];
        const label = prettyName(key);
        if (raw !== undefined) {
          const val = normalizeValue(raw, dataset);
          zEquity[i][j] = val;
          const er = (val / 100) / baseline; // ratio, unitless
          zEr[i][j] = er;
          nameText[i][j] = label;
        } else {
          zEquity[i][j] = 0;
          zEr[i][j] = 0;
          nameText[i][j] = label;
        }
      }
    }
    return { zEquity, zEr, nameText, players };
  }, [dict, dataset]);

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!chartRef.current) return;
      const Plotly = (await import('plotly.js-dist-min')).default as any;
      const data = [{
        x: RANKS,
        y: RANKS,
        z: showEr ? grid.zEr : grid.zEquity,
        zmin: 0,
        zmid: showEr ? 1 : null,
        zmax: showEr ? null : 100,
        type: 'heatmap',
        colorscale: 'Viridis',
        reversescale: false,
        showscale: true,
        colorbar: {
          title: showEr ? 'ER' : 'Equity (%)',
          tickformat: showEr ? '.2f' : '.0f',
          ticksuffix: showEr ? '' : '%'
        },
        text: grid.nameText,
        hoverinfo: 'text',
        hovertemplate: '%{text} %{z}<extra></extra>',
        texttemplate: null,
        textfont: { color: 'var(--ifm-font-color-base)', size: 10 },
      }];
      const layout: any = {
        title: { text: '<b>Preflop Equity Heatmap</b>', font: { size: 14 } },
        xaxis: { type: 'category', categoryorder: 'array', categoryarray: RANKS },
        yaxis: { autorange: 'reversed', type: 'category', categoryorder: 'array', categoryarray: RANKS },
        margin: { t: 60, r: 10, b: 60, l: 60 },
        // plot_bgcolor: 'transparent',
        // paper_bgcolor: 'transparent',
        font: { color: 'var(--ifm-font-color-base)' },
      };
      await Plotly.newPlot(chartRef.current, data, layout, { displayModeBar: false });
      if (disposed) Plotly.purge(chartRef.current);
    })();
    return () => { disposed = true; };
  }, [grid, showEr]);

  return (
    <div>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', marginBottom: 12 }}>
        <label>
          dataset:
          <select value={dataset} onChange={e => setDataset(e.target.value as DatasetKey)} style={{ marginLeft: 8 }}>
            <option value="2p">2 players (heads-up)</option>
            <option value="3p">3 players</option>
            <option value="4p">4 players</option>
          </select>
        </label>
        <label>
          show Equity Ratio:
          <input type="checkbox" checked={showEr} onChange={e => setShowEr(e.target.checked)} style={{ marginLeft: 8 }} />
        </label>
      </div>
      <div ref={chartRef} style={{ height: 600, width: '100%' , marginBottom: 16}} />
    </div>
  );
}


