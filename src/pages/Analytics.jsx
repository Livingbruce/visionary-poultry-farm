import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  PieChart as PieIcon, 
  BarChart3,
  Scale
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import '../styles/Analytics.css';

// Sample mock data for Revenue vs Cost
const comparisonData = [
  { month: 'Jan', revenue: 9200, cost: 5800 },
  { month: 'Feb', revenue: 9800, cost: 6100 },
  { month: 'Mar', revenue: 10400, cost: 6300 },
  { month: 'Apr', revenue: 10100, cost: 5900 },
  { month: 'May', revenue: 11800, cost: 6700 },
  { month: 'Jun', revenue: 12450, cost: 7100 },
];

// Cost breakdown categories
const costBreakdownData = [
  { name: 'Feeds', value: 4200, color: '#1b4332' },
  { name: 'Medicine & Vaccines', value: 950, color: '#2d6a4f' },
  { name: 'Transport & Logistics', value: 750, color: '#52b788' },
  { name: 'Housing & Utilities', value: 1200, color: '#e9c46a' },
];

export default function Analytics() {
  return (
    <div className="page analytics-container">
      {/* Page Header */}
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Insights and data visualizations for your poultry farm.</p>
      </div>

      <div className="financial-overview">
        <h2 className="section-title">Financial Overview</h2>

        <div className="financial-cards">
          <div className="financial-card revenue">
            <div className="card-header">
              <h3>Total Revenue</h3>
              <div className="icon-wrapper"><DollarSign size={20} /></div>
            </div>
            <div className="card-content" id="total-revenue">$12,450.00</div>
            <div className="card-footer">
              <span>Revenue generated from sales of egg and other products.</span>
            </div>
          </div>

          <div className="financial-card cost">
            <div className="card-header">
              <h3>Cost of Production</h3>
              <div className="icon-wrapper"><Receipt size={20} /></div>
            </div>
            <div className="card-content" id="cost-production">$7,100.00</div>
            <div className="card-footer">
              <span>Feeds, medicine, transport, housing, and labor costs.</span>
            </div>
          </div>

          <div className="financial-card profit">
            <div className="card-header">
              <h3>Profit/Loss Margin</h3>
              <div className="icon-wrapper"><Scale size={20} /></div>
            </div>
            <div className="card-content" id="profitability">+$5,350.00</div>
            <div className="card-footer">
              <span>Net profit generated from overall farm operations.</span>
            </div>
          </div>

          <div className="financial-card receivable">
            <div className="card-header">
              <h3>Accounts Receivable</h3>
              <div className="icon-wrapper"><TrendingUp size={20} /></div>
            </div>
            <div className="card-content" id="accounts-receivable">$2,400.00</div>
            <div className="card-footer">
              <span>Amounts owed to the farm by trade customers.</span>
            </div>
          </div>

          <div className="financial-card payable">
            <div className="card-header">
              <h3>Accounts Payable</h3>
              <div className="icon-wrapper"><CreditCard size={20} /></div>
            </div>
            <div className="card-content" id="accounts-payable">$1,150.00</div>
            <div className="card-footer">
              <span>Amounts owed by the farm to feed and drug suppliers.</span>
            </div>
          </div>
        </div>

        {/* Analytics Graphs Section */}
        <div className="financial-analytics">
          <h2 className="section-title">Financial Analytics</h2>

          <div className="graphs-grid">
            {/* Revenue vs Cost Comparison */}
            <div className="graph-card">
              <div className="graph-header">
                <BarChart3 size={20} />
                <h3>Revenue vs Cost of Production</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="revenue" name="Total Revenue ($)" fill="#1b4332" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cost" name="Cost of Production ($)" fill="#e76f51" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Production Cost Breakdown */}
            <div className="graph-card">
              <div className="graph-header">
                <PieIcon size={20} />
                <h3>Production Cost Distribution</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}