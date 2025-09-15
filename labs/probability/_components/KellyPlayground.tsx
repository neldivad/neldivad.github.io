import React, {useEffect, useMemo, useState} from 'react';

type SampleRow = {
  probWin: number; // probability of win per trial (0..1)
  odds: number;    // net odds (e.g., 1 means even odds)
};

function parseCsv(text: string): SampleRow[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [p, o] = line.split(',').map(s => s.trim());
      return {probWin: Number(p), odds: Number(o)};
    })
    .filter(r => Number.isFinite(r.probWin) && Number.isFinite(r.odds));
}

function kellyFraction(probWin: number, odds: number): number {
  // f* = (bp - q) / b  where b = odds, p = probWin, q = 1-p
  const b = odds;
  const p = probWin;
  const q = 1 - p;
  const numerator = b * p - q;
  if (b === 0) return 0;
  return numerator / b;
}

export default function KellyPlayground(): JSX.Element {
  const [csvPreview, setCsvPreview] = useState<string>('');
  const [rows, setRows] = useState<SampleRow[]>([]);
  const [fractionScale, setFractionScale] = useState<number>(1);

  useEffect(() => {
    fetch('/data/kelly-sample.csv')
      .then(r => r.ok ? r.text() : '')
      .then(text => {
        setCsvPreview(text);
        setRows(parseCsv(text));
      })
      .catch(() => {});
  }, []);

  const results = useMemo(() => {
    return rows.map(r => {
      const fStar = kellyFraction(r.probWin, r.odds);
      const betFraction = Math.max(0, fStar * fractionScale);
      return { ...r, fStar, betFraction };
    });
  }, [rows, fractionScale]);

  return (
    <div style={{padding: 16}}>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}}>Fraction scale: {fractionScale.toFixed(2)}x</label>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={fractionScale}
          onChange={e => setFractionScale(Number(e.target.value))}
        />
      </div>

      <details>
        <summary>Preview sample CSV</summary>
        <pre style={{whiteSpace: 'pre-wrap'}}>{csvPreview || 'Loading sample...'}</pre>
      </details>

      <table style={{width: '100%', marginTop: 16, borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign: 'left', borderBottom: '1px solid #555'}}>p(win)</th>
            <th style={{textAlign: 'left', borderBottom: '1px solid #555'}}>odds (b)</th>
            <th style={{textAlign: 'left', borderBottom: '1px solid #555'}}>Kelly f*</th>
            <th style={{textAlign: 'left', borderBottom: '1px solid #555'}}>Bet fraction (scaled)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.probWin.toFixed(2)}</td>
              <td>{r.odds.toFixed(2)}</td>
              <td>{r.fStar.toFixed(3)}</td>
              <td>{r.betFraction.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


