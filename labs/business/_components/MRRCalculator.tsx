import React, { useState, useEffect, useRef } from 'react';

interface MRRData {
  month: string;
  // movements ($)
  newMRR: number;
  expansionMRR: number;
  churnedMRR: number;
  contractionMRR: number;
  netMRR: number;
  totalMRR: number;
  // users
  free?: number;
  basic?: number;
  adv?: number;
  cancelledMonthly?: number;
  upgradesMonthly?: number;
  downgradesMonthly?: number;
  // monetization
  arpu: number;
  basicRevenue?: number;
  advRevenue?: number;
  // realized monthly rates for charting (% units)
  appliedGrowthPct?: number;
  appliedChurnPct?: number;
}

interface MRRCalculatorProps {}

const colorway = [
  '#636EFA',
  '#EF553B',
  '#00CC96',
  '#AB63FA',
  //'#FFA15A',
  '#182844',
  // '#19D3F3',
  '#6f4d96',
  '#FF6692',
  '#B6E880',
  '#FF97FF',
  '#FECB52',
];

const MRRCalculator: React.FC<MRRCalculatorProps> = () => {
  const chartHeight = 400;

  // Sliders
  const [users0, setUsers0] = useState<number>(1000);
  const [growthPct, setGrowthPct] = useState<number>(6); // 0-20%
  const [churnPct, setChurnPct] = useState<number>(3); // 0-20%
  const [growthVolPct, setGrowthVolPct] = useState<number>(25); // 5-50%
  const [churnVolPct, setChurnVolPct] = useState<number>(25); // 5-50%

  // Basic tier
  const [priceBasic, setPriceBasic] = useState<number>(10);
  const [baseBasicPct, setBaseBasicPct] = useState<number>(10.0);
  const [probFreeToBasic, setProbFreeToBasic] = useState<number>(10);
  const [probBasicToFree, setProbBasicToFree] = useState<number>(5);

  // Advanced tier
  const [priceAdv, setPriceAdv] = useState<number>(50);
  const [baseAdvPct, setBaseAdvPct] = useState<number>(1.0);
  const [probBasicToAdv, setProbBasicToAdv] = useState<number>(10);
  const [probAdvToBasic, setProbAdvToBasic] = useState<number>(10);

  // no legacy syncing needed
  
  const [mrrData, setMRRData] = useState<MRRData[]>([]);
  
  const mrrChartRef = useRef<HTMLDivElement>(null);
  const growthChartRef = useRef<HTMLDivElement>(null);
  const customerChartRef = useRef<HTMLDivElement>(null);
  const rateChartRef = useRef<HTMLDivElement>(null);

  // Calculate derived metrics (longevity used in metrics panel)
  const customerLongevityMonths = (() => {
    const c = churnPct / 100;
    if (c <= 0) return 60; // cap at 60 months
    const months = 1 / c;
    return Math.min(60, months);
  })();

  // Generate tiered 5-year data from sliders
  useEffect(() => {
    const months = 60; // 5 years
    const data: MRRData[] = [];

    const g = growthPct / 100;
    const c = churnPct / 100;
    const gVol = Math.max(0, growthVolPct / 100);
    const cVol = Math.max(0, churnVolPct / 100);
    const bB = baseBasicPct / 100;
    const bA = baseAdvPct / 100;
    const bF = Math.max(0, 1 - (bB + bA));
    const uFB = probFreeToBasic / 100;
    const dBF = probBasicToFree / 100;
    const uBA = probBasicToAdv / 100;
    const dAB = probAdvToBasic / 100;

    // Initialize tiers by base mix
    let F = Math.round(users0 * bF);
    let B = Math.round(users0 * bB);
    let A = Math.max(0, users0 - F - B);

    for (let i = 0; i < months; i++) {
      const monthName = new Date(2022, i).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const U = Math.max(0, F + B + A);

      // Apply multiplicative volatility to growth and churn this month
      const gFactor = 1 + (Math.random() * 2 - 1) * gVol; // uniform in [1-gVol, 1+gVol]
      const cFactor = 1 + (Math.random() * 2 - 1) * cVol;
      const gMonth = Math.max(0, g * gFactor);
      const cMonth = Math.max(0, c * cFactor);

      // 1) New acquisition
      const newUsers = Math.round(U * gMonth);
      const newF = Math.round(newUsers * bF);
      const newB = Math.round(newUsers * bB);
      const newA = Math.max(0, newUsers - newF - newB);

      // 2) Churn exits
      const churnF = Math.round(F * cMonth);
      const churnB = Math.round(B * cMonth);
      const churnA = Math.round(A * cMonth);

      // 3) Cross-tier moves on remaining + new
      const F_after = Math.max(0, F - churnF + newF);
      const B_after = Math.max(0, B - churnB + newB);
      const A_after = Math.max(0, A - churnA + newA);

      const upFB = Math.round(F_after * uFB);
      const downBF = Math.round(B_after * dBF);
      const upBA = Math.round(Math.max(0, B_after - downBF) * uBA);
      const downAB = Math.round(A_after * dAB);

      // 4) Update tiers to next month
      const F_next = Math.max(0, F_after - upFB + downBF);
      const B_next = Math.max(0, B_after + upFB - downBF - upBA + downAB);
      const A_next = Math.max(0, A_after + upBA - downAB);

      // Revenue and ARPU based on current month tiers
      const basicRevenue = B * priceBasic;
      const advRevenue = A * priceAdv;
      const totalMRR = basicRevenue + advRevenue;
      const arpu = U > 0 ? totalMRR / U : 0;

      // Movements ($) for this month
      const newMRR = newB * priceBasic + newA * priceAdv;
      const expansionMRR = upFB * priceBasic + upBA * (priceAdv - priceBasic);
      const churnedMRR = churnB * priceBasic + churnA * priceAdv;
      const contractionMRR = downAB * (priceAdv - priceBasic) + downBF * priceBasic;
      const netMRR = newMRR + expansionMRR - churnedMRR - contractionMRR;

      data.push({
        month: monthName,
        newMRR,
        expansionMRR,
        churnedMRR: -churnedMRR,
        contractionMRR: -contractionMRR,
        netMRR,
        totalMRR,
        free: F,
        basic: B,
        adv: A,
        cancelledMonthly: churnF + churnB + churnA,
        upgradesMonthly: upFB + upBA,
        downgradesMonthly: downBF + downAB,
        arpu,
        basicRevenue,
        advRevenue,
        appliedGrowthPct: gMonth * 100,
        appliedChurnPct: cMonth * 100
      });

      F = F_next; B = B_next; A = A_next;
    }

    setMRRData(data);
  }, [users0, growthPct, churnPct, growthVolPct, churnVolPct, priceBasic, baseBasicPct, probFreeToBasic, probBasicToFree, priceAdv, baseAdvPct, probBasicToAdv, probAdvToBasic]);

  // Render charts when data changes
  useEffect(() => {
    // dynamic import
    const plotly = require('plotly.js-dist-min');

    if (mrrData.length === 0) return;

    // MRR Movement Chart
    if (mrrChartRef.current) {
      const months = mrrData.map(d => d.month);
      const tickvals = months.filter((_, i) => i % 6 === 0);
      const mrrChartData = [
        { x: months, y: mrrData.map(d => d.newMRR), type: 'bar', name: 'New MRR' },
        { x: months, y: mrrData.map(d => d.expansionMRR), type: 'bar', name: 'Expansion MRR' },
        { x: months, y: mrrData.map(d => d.churnedMRR), type: 'bar', name: 'Churned MRR' },
        { x: months, y: mrrData.map(d => d.contractionMRR), type: 'bar', name: 'Contraction MRR' },
        { x: months, y: mrrData.map(d => d.totalMRR), type: 'scatter', mode: 'lines', line: {width: 5}, name: 'Total MRR', yaxis: 'y2' }
      ];

      const mrrLayout = {
        title: {
          text: 'MRR Movements Over Time',
          font: { size: 16 }
        },
        xaxis: { title: 'Month', type: 'category', tickvals, ticktext: tickvals },
        yaxis: { 
          title: 'MRR Movement ($)',
          side: 'left'
        },
        yaxis2: {
          title: 'Total MRR ($)',
          side: 'right',
          overlaying: 'y',
          tickmode: 'sync',
          rangemode: 'tozero'
        },
        barmode: 'relative',
        hovermode: 'x unified',
        height: chartHeight,
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 },
        colorway : colorway
      };

      plotly.newPlot(mrrChartRef.current, mrrChartData, mrrLayout, { responsive: true, displayModeBar: true });
    }

    // Revenue overlay area + ARPU (Chart 2)
    if (growthChartRef.current) {
      const months = mrrData.map(d => d.month);
      const tickvals = months.filter((_, i) => i % 6 === 0);
      const traces = [
        { x: months, y: mrrData.map(d => Math.max(0, d.basicRevenue || 0)), type: 'scatter', mode: 'lines', name: 'Basic', fill: 'tozeroy', opacity: 0.2 },
        { x: months, y: mrrData.map(d => Math.max(0, d.advRevenue || 0)), type: 'scatter', mode: 'lines', name: 'Adv', fill: 'tozeroy', opacity: 0.2 },
        { x: months, y: mrrData.map(d => Math.max(0, -(d.churnedMRR))), type: 'scatter', mode: 'lines', name: 'Cancelled', fill: 'tozeroy', opacity: 0.2 },
        { x: months, y: mrrData.map(d => Math.max(0, d.expansionMRR)), type: 'scatter', mode: 'lines', name: 'Upgrades', fill: 'tozeroy', opacity: 0.2 },
        { x: months, y: mrrData.map(d => Math.max(0, -(d.contractionMRR))), type: 'scatter', mode: 'lines', name: 'Downgrades', fill: 'tozeroy', opacity: 0.2 },
        { x: months, y: mrrData.map(d => d.totalMRR), type: 'scatter', mode: 'lines', line: {width: 5}, name: 'Total MRR ($)' },
        { x: months, y: mrrData.map(d => d.arpu), type: 'scatter', mode: 'lines', line: {width: 5}, name: 'ARPU', yaxis: 'y2', visible: 'true' },
      ];

      const layout = {
        title: {
          text: 'Revenue (overlay area) & ARPU',
          font: { size: 16 }
        },
        xaxis: { title: 'Month', type: 'category', tickvals, ticktext: tickvals },
        yaxis: { title: {text: 'Revenue ($)'}, rangemode: 'tozero' },
        yaxis2: { title: {text: 'ARPU'}, overlaying: 'y', side: 'right', rangemode: 'tozero' },
        hovermode: 'x unified',
        height: chartHeight,
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 },
        colorway : colorway
      } as any;

      plotly.newPlot(growthChartRef.current, traces, layout, { responsive: true, displayModeBar: true });
    }

    // Users by tier (Chart 3)
    if (customerChartRef.current) {
      const months = mrrData.map(d => d.month);
      const tickvals = months.filter((_, i) => i % 6 === 0);
      const traces = [
        { x: months, y: mrrData.map(d => d.basic || 0), type: 'scatter', mode: 'lines', name: 'Basic' },
        { x: months, y: mrrData.map(d => d.adv || 0), type: 'scatter', mode: 'lines', name: 'Adv' },
        { x: months, y: mrrData.map(d => d.cancelledMonthly || 0), type: 'scatter', mode: 'lines', name: 'Cancelled', visible: 'legendonly' },
        { x: months, y: mrrData.map(d => d.upgradesMonthly || 0), type: 'scatter', mode: 'lines', name: 'Upgrades', visible: 'legendonly' },
        { x: months, y: mrrData.map(d => d.downgradesMonthly || 0), type: 'scatter', mode: 'lines', name: 'Downgrades', visible: 'legendonly' },
        { x: months, y: mrrData.map(d => (d.free || 0) + (d.basic || 0) + (d.adv || 0)), type: 'scatter', mode: 'lines', line: {width: 5}, name: 'Total Users', yaxis: 'y2' }
      ];

      const layout = {
        title: {
          text: 'Users by Tier',
          font: { size: 16 }
        },
        xaxis: { title: 'Month', type: 'category', tickvals, ticktext: tickvals },
        yaxis: { title: {text: 'Users'}, rangemode: 'tozero' },
        yaxis2: { title: {text: 'Total Users'}, overlaying: 'y', side: 'right', rangemode: 'tozero' },
        hovermode: 'x unified',
        height: chartHeight,
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 },
        colorway : colorway
      };

      plotly.newPlot(customerChartRef.current, traces, layout, { responsive: true, displayModeBar: true });
    }

    // Rates & Mix (Chart 4)
    if (rateChartRef.current) {
      const months = mrrData.map(d => d.month);
      const tickvals = months.filter((_, i) => i % 6 === 0);
      const totals = mrrData.map(d => (d.free || 0) + (d.basic || 0) + (d.adv || 0));
      const basicPctSeries = mrrData.map((d, i) => {
        const t = totals[i] || 1; return ((d.basic || 0) / t) * 100;
      });
      const advPctSeries = mrrData.map((d, i) => {
        const t = totals[i] || 1; return ((d.adv || 0) / t) * 100;
      });

      const traces = [
        { x: months, y: mrrData.map(d => d.appliedGrowthPct || 0), type: 'scatter', mode: 'lines', name: 'Growth %', line: {width: 5} },
        { x: months, y: mrrData.map(d => d.appliedChurnPct || 0), type: 'scatter', mode: 'lines', name: 'Churn %', line: {width: 3} },
        { x: months, y: basicPctSeries, type: 'scatter', mode: 'lines', name: 'Basic %', yaxis: 'y2', line: { color: '#64b5f6', width: 2, dash: 'dot' } },
        { x: months, y: advPctSeries, type: 'scatter', mode: 'lines', name: 'Adv %', yaxis: 'y2', line: { color: '#1976d2', width: 3, dash: 'dot' } }
      ];

      const layout = {
        title: {
          text: 'Rates & Mix',
          font: { size: 16 }
        },
        xaxis: { title: 'Month', type: 'category', tickvals, ticktext: tickvals },
        yaxis: { title: {text: 'Rates (%)'}, rangemode: 'tozero' },
        yaxis2: { title: {text: 'Tier Mix (%)'}, overlaying: 'y', side: 'right', rangemode: 'tozero' },
        hovermode: 'x unified',
        height: chartHeight,
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 },
        colorway : colorway
      } as any;

      plotly.newPlot(rateChartRef.current, traces, layout, { responsive: true, displayModeBar: true });
    }
  }, [mrrData]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>MRR Movement Simulator</h2>
      
      {/* Input Controls: three columns per spec */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        {/* Column 1 */}
        <div style={{ padding: '16px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Growth & Retention</div>

          <div style={{ marginTop: '10px' }}>
            <label>Users: {users0}</label>
            <input type="range" min={500} max={10000} step={500} value={users0} onChange={(e)=>setUsers0(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>Monthly growth %: {growthPct.toFixed(1)}%</label>
            <input type="range" min={0} max={20} step={0.1} value={growthPct} onChange={(e)=>setGrowthPct(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Monthly churn %: {churnPct.toFixed(1)}%</label>
            <input type="range" min={0} max={20} step={0.1} value={churnPct} onChange={(e)=>setChurnPct(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>Growth volatility %: {growthVolPct.toFixed(0)}%</label>
            <input type="range" min={5} max={100} step={5} value={growthVolPct} onChange={(e)=>setGrowthVolPct(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Churn volatility %: {churnVolPct.toFixed(0)}%</label>
            <input type="range" min={5} max={100} step={5} value={churnVolPct} onChange={(e)=>setChurnVolPct(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </div>

        {/* Column 2 */}
        <div style={{ padding: '16px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Basic Plan</div>
          <label style={{ display: 'block', marginBottom: '6px' }}>Price (${priceBasic})</label>
          <input type="range" min={5} max={50} step={5} value={priceBasic} onChange={(e)=>setPriceBasic(Number(e.target.value))} style={{ width: '100%' }} />
          <div style={{ marginTop: '10px' }}>
            <label>Base basic %: {baseBasicPct.toFixed(1)}%</label>
            <input type="range" min={0} max={100} step={0.5} value={baseBasicPct} onChange={(e)=>setBaseBasicPct(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Upgrade prob (Free→Basic): {probFreeToBasic.toFixed(1)}%</label>
            <input type="range" min={0} max={100} step={0.5} value={probFreeToBasic} onChange={(e)=>setProbFreeToBasic(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Downgrade prob (Basic→Free): {probBasicToFree.toFixed(1)}%</label>
            <input type="range" min={0} max={100} step={0.5} value={probBasicToFree} onChange={(e)=>setProbBasicToFree(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </div>

        {/* Column 3 */}
        <div style={{ padding: '16px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Advanced Plan</div>
          <label style={{ display: 'block', marginBottom: '6px' }}>Price (${priceAdv})</label>
          <input type="range" min={50} max={500} step={10} value={priceAdv} onChange={(e)=>setPriceAdv(Number(e.target.value))} style={{ width: '100%' }} />
          <div style={{ marginTop: '10px' }}>
            <label>Base adv %: {baseAdvPct.toFixed(1)}%</label>
            <input type="range" min={0} max={100} step={0.5} value={baseAdvPct} onChange={(e)=>setBaseAdvPct(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Upgrade prob (Basic→Adv): {probBasicToAdv.toFixed(1)}%</label>
            <input type="range" min={0} max={100} step={0.5} value={probBasicToAdv} onChange={(e)=>setProbBasicToAdv(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Downgrade prob (Adv→Basic): {probAdvToBasic.toFixed(1)}%</label>
            <input type="range" min={0} max={100} step={0.5} value={probAdvToBasic} onChange={(e)=>setProbAdvToBasic(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <div style={{ padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {formatCurrency(mrrData.length ? mrrData[mrrData.length-1].totalMRR : 0)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>Current MRR</div>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {formatCurrency((mrrData.length ? mrrData[mrrData.length-1].totalMRR : 0) * 12)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>ARR</div>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {mrrData.length ? `$${(mrrData[mrrData.length-1].arpu).toFixed(2)}` : '$0.00'}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>ARPU</div>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {(() => { const arpu60 = mrrData.length ? mrrData[mrrData.length-1].arpu : 0; const c = churnPct/100; return c>0 ? formatCurrency(arpu60 / c) : '∞'; })()}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>Calculated LTV</div>
        </div>

        <div style={{ padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {customerLongevityMonths.toFixed(2)} months
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>Customer Longevity (capped at 60)</div>
        </div>
      </div>

      {/* MRR Movement Chart */}
      <div style={{ marginBottom: '30px' }}>
        <h3>MRR Movements Over Time</h3>
        <div ref={mrrChartRef} style={{ height: '400px', width: '100%' }}></div>
      </div>

      {/* Revenue Overlay & ARPU */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Revenue & ARPU</h3>
        <div ref={growthChartRef} style={{ height: chartHeight, width: '100%' }}></div>
      </div>

      {/* Customer Growth Chart */}
      <div>
        <h3>Customer Growth</h3>
        <div ref={customerChartRef} style={{ height: chartHeight, width: '100%' }}></div>
      </div>

      {/* Rate Chart */}
      <div style={{ marginTop: '30px' }}>
        <h3>Rates & Mix</h3>
        <div ref={rateChartRef} style={{ height: chartHeight, width: '100%' }}></div>
      </div>
    </div>
  );
};

export default MRRCalculator;
