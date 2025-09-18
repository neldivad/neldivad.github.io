import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface MRRData {
  month: string;
  newMRR: number;
  expansionMRR: number;
  reactivationMRR: number;
  churnedMRR: number;
  contractionMRR: number;
  netMRR: number;
  totalMRR: number;
  customers: number;
  arpu: number;
}

interface MRRCalculatorProps {
  initialCustomers?: number;
  initialARPU?: number;
  initialLTV?: number;
  initialChurnRate?: number;
  initialMAU?: number;
  initialPMAU?: number;
  initialFMAU?: number;
}

const MRRCalculator: React.FC<MRRCalculatorProps> = ({
  initialCustomers = 1000,
  initialARPU = 50,
  initialLTV = 500,
  initialChurnRate = 0.05,
  initialMAU = 5000,
  initialPMAU = 1000,
  initialFMAU = 4000
}) => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [arpu, setARPU] = useState(initialARPU);
  const [ltv, setLTV] = useState(initialLTV);
  const [churnRate, setChurnRate] = useState(initialChurnRate);
  const [mau, setMAU] = useState(initialMAU);
  const [pmau, setPMAU] = useState(initialPMAU);
  const [fmau, setFMAU] = useState(initialFMAU);
  
  const [mrrData, setMRRData] = useState<MRRData[]>([]);
  
  const mrrChartRef = useRef<HTMLDivElement>(null);
  const growthChartRef = useRef<HTMLDivElement>(null);
  const customerChartRef = useRef<HTMLDivElement>(null);

  // Calculate derived metrics
  const currentMRR = customers * arpu;
  const calculatedLTV = arpu / churnRate;
  const conversionRate = pmau / mau;
  const freeToPaidRate = pmau / fmau;

  // Generate MRR movement data
  useEffect(() => {
    const months = 24; // 2 years of data
    const data: MRRData[] = [];
    
    let currentCustomers = customers;
    let currentTotalMRR = currentMRR;
    
    for (let i = 0; i < months; i++) {
      const monthName = new Date(2022, i).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Simulate realistic MRR movements
      const baseGrowth = Math.max(0, 0.02 + (Math.random() - 0.5) * 0.01); // 1.5-2.5% base growth
      const churnVariation = churnRate + (Math.random() - 0.5) * 0.01; // ±0.5% churn variation
      
      // New MRR (new customers)
      const newCustomers = Math.floor(currentCustomers * baseGrowth);
      const newMRR = newCustomers * arpu;
      
      // Expansion MRR (existing customers upgrading)
      const expansionRate = 0.01 + Math.random() * 0.01; // 1-2% expansion
      const expansionMRR = currentTotalMRR * expansionRate;
      
      // Reactivation MRR (churned customers returning)
      const reactivationRate = 0.005 + Math.random() * 0.005; // 0.5-1% reactivation
      const reactivationMRR = currentTotalMRR * reactivationRate;
      
      // Churned MRR (customers leaving)
      const churnedCustomers = Math.floor(currentCustomers * churnVariation);
      const churnedMRR = churnedCustomers * arpu;
      
      // Contraction MRR (customers downgrading)
      const contractionRate = 0.005 + Math.random() * 0.005; // 0.5-1% contraction
      const contractionMRR = currentTotalMRR * contractionRate;
      
      // Net MRR movement
      const netMRR = newMRR + expansionMRR + reactivationMRR - churnedMRR - contractionMRR;
      
      // Update totals
      currentCustomers = Math.max(0, currentCustomers + newCustomers - churnedCustomers);
      currentTotalMRR = Math.max(0, currentTotalMRR + netMRR);
      
      data.push({
        month: monthName,
        newMRR,
        expansionMRR,
        reactivationMRR,
        churnedMRR: -churnedMRR, // Negative for visualization
        contractionMRR: -contractionMRR, // Negative for visualization
        netMRR,
        totalMRR: currentTotalMRR,
        customers: currentCustomers,
        arpu: currentTotalMRR / currentCustomers || arpu
      });
    }
    
    setMRRData(data);
  }, [customers, arpu, churnRate]);

  // Render charts when data changes
  useEffect(() => {
    if (mrrData.length === 0) return;

    // MRR Movement Chart
    if (mrrChartRef.current) {
      const mrrChartData = [
        {
          x: mrrData.map(d => d.month),
          y: mrrData.map(d => d.newMRR),
          type: 'bar',
          name: 'New MRR',
          marker: { color: '#4fc3f7' },
          stackgroup: 'positive'
        },
        {
          x: mrrData.map(d => d.month),
          y: mrrData.map(d => d.expansionMRR),
          type: 'bar',
          name: 'Expansion MRR',
          marker: { color: '#29b6f6' },
          stackgroup: 'positive'
        },
        {
          x: mrrData.map(d => d.month),
          y: mrrData.map(d => d.reactivationMRR),
          type: 'bar',
          name: 'Reactivation MRR',
          marker: { color: '#0288d1' },
          stackgroup: 'positive'
        },
        {
          x: mrrData.map(d => d.month),
          y: mrrData.map(d => d.churnedMRR),
          type: 'bar',
          name: 'Churned MRR',
          marker: { color: '#ffab91' },
          stackgroup: 'negative'
        },
        {
          x: mrrData.map(d => d.month),
          y: mrrData.map(d => d.contractionMRR),
          type: 'bar',
          name: 'Contraction MRR',
          marker: { color: '#ff7043' },
          stackgroup: 'negative'
        },
        {
          x: mrrData.map(d => d.month),
          y: mrrData.map(d => d.totalMRR),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Total MRR',
          line: { color: '#2e7d32', width: 3 },
          yaxis: 'y2'
        }
      ];

      const mrrLayout = {
        title: 'MRR Movements Over Time',
        xaxis: { title: 'Month' },
        yaxis: { 
          title: 'MRR Movement ($)',
          side: 'left'
        },
        yaxis2: {
          title: 'Total MRR ($)',
          side: 'right',
          overlaying: 'y',
          tickmode: 'sync'
        },
        barmode: 'relative',
        hovermode: 'x unified',
        height: 400,
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 }
      };

      Plotly.newPlot(mrrChartRef.current, mrrChartData, mrrLayout, { responsive: true, displayModeBar: true });
    }

    // Total MRR Growth Chart
    if (growthChartRef.current) {
      const growthChartData = [
        {
          x: mrrData.map(d => d.month),
          y: mrrData.map(d => d.totalMRR),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Total MRR',
          line: { color: '#2e7d32', width: 3 },
          marker: { size: 6 }
        }
      ];

      const growthLayout = {
        title: 'Total MRR Growth',
        xaxis: { title: 'Month' },
        yaxis: { title: 'Total MRR ($)' },
        hovermode: 'x unified',
        height: 300,
        showlegend: false
      };

      Plotly.newPlot(growthChartRef.current, growthChartData, growthLayout, { responsive: true, displayModeBar: true });
    }

    // Customer Growth Chart
    if (customerChartRef.current) {
      const customerChartData = [
        {
          x: mrrData.map(d => d.month),
          y: mrrData.map(d => d.customers),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Customers',
          line: { color: '#1976d2', width: 3 },
          marker: { size: 6 }
        }
      ];

      const customerLayout = {
        title: 'Customer Growth',
        xaxis: { title: 'Month' },
        yaxis: { title: 'Number of Customers' },
        hovermode: 'x unified',
        height: 300,
        showlegend: false
      };

      Plotly.newPlot(customerChartRef.current, customerChartData, customerLayout, { responsive: true, displayModeBar: true });
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
      
      {/* Input Controls */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px',
        padding: '20px',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Customers
          </label>
          <input
            type="number"
            value={customers}
            onChange={(e) => setCustomers(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ARPU ($)
          </label>
          <input
            type="number"
            value={arpu}
            onChange={(e) => setARPU(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            LTV ($)
          </label>
          <input
            type="number"
            value={ltv}
            onChange={(e) => setLTV(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Churn Rate (%)
          </label>
          <input
            type="number"
            step="0.001"
            value={churnRate * 100}
            onChange={(e) => setChurnRate(Number(e.target.value) / 100)}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            MAU
          </label>
          <input
            type="number"
            value={mau}
            onChange={(e) => setMAU(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            PMAU (Paid)
          </label>
          <input
            type="number"
            value={pmau}
            onChange={(e) => setPMAU(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            FMAU (Free)
          </label>
          <input
            type="number"
            value={fmau}
            onChange={(e) => setFMAU(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px' }}
          />
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
            {formatCurrency(currentMRR)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>Current MRR</div>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {formatCurrency(currentMRR * 12)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>ARR</div>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {formatPercent(conversionRate)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>Conversion Rate</div>
        </div>
        
        <div style={{ padding: '15px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
            {formatCurrency(calculatedLTV)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>Calculated LTV</div>
        </div>
      </div>

      {/* MRR Movement Chart */}
      <div style={{ marginBottom: '30px' }}>
        <h3>MRR Movements Over Time</h3>
        <div ref={mrrChartRef} style={{ height: '400px', width: '100%' }}></div>
      </div>

      {/* Total MRR Growth Chart */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Total MRR Growth</h3>
        <div ref={growthChartRef} style={{ height: '300px', width: '100%' }}></div>
      </div>

      {/* Customer Growth Chart */}
      <div>
        <h3>Customer Growth</h3>
        <div ref={customerChartRef} style={{ height: '300px', width: '100%' }}></div>
      </div>
    </div>
  );
};

export default MRRCalculator;
