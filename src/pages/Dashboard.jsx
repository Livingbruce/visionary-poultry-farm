import React from 'react';
import { Egg, Bird, Wheat, DollarSign, ShoppingBag, BarChart2, TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import '../styles/Dashboard.css';

// Sample monthly data
const monthlyData = [
  { month: 'Jan', eggs: 32000, sales: 9200 },
  { month: 'Feb', eggs: 35000, sales: 9800 },
  { month: 'Mar', eggs: 38500, sales: 10400 },
  { month: 'Apr', eggs: 36000, sales: 10100 },
  { month: 'May', eggs: 41000, sales: 11800 },
  { month: 'Jun', eggs: 42850, sales: 12450 },
];

function Dashboard() {
  return (
    <div className="page dashboard-container">
      {/* Header & Metric Cards */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="subtitle">Daily yield, sales summary, and farm status.</p>
        </div>
        <div className="dashboard-icons">
          <span className="icon-badge"><BarChart2 size={20} /></span>
          <span className="icon-badge"><TrendingUp size={20} /></span>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h2>Monthly Yield</h2>
            <div className="card-icon-wrapper yield"><Egg size={20} /></div>
          </div>
          <div className="card-content" id="monthly-yield">
            <span className="metric-value">42,850</span>
            <span className="metric-unit">Eggs Collected</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Poultry Population</h2>
            <div className="card-icon-wrapper population"><Bird size={20} /></div>
          </div>
          <div className="card-content" id="poultry-population">
            <span className="metric-value">1,450</span>
            <span className="metric-unit">Active Birds</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Feed Consumption</h2>
            <div className="card-icon-wrapper feed"><Wheat size={20} /></div>
          </div>
          <div className="card-content" id="feed-consumption">
            <span className="metric-value">3.2 Tons</span>
            <span className="metric-unit">Used this month</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Monthly Sales</h2>
            <div className="card-icon-wrapper sales"><DollarSign size={20} /></div>
          </div>
          <div className="card-content" id="monthly-sales">
            <span className="metric-value">$12,450</span>
            <span className="metric-unit">+14% vs last month</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Monthly Purchases</h2>
            <div className="card-icon-wrapper purchases"><ShoppingBag size={20} /></div>
          </div>
          <div className="card-content" id="monthly-purchases">
            <span className="metric-value">$4,120</span>
            <span className="metric-unit">Feed & Supplies</span>
          </div>
        </div>
      </div>

      {/* Analytics Section with Graphs */}
      <div className="dashboard-analysis">
        <div className="dashboard-graph">
          <h3>Egg Production Trend</h3>
          <div className="graph-container">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="eggColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="eggs" stroke="#1b4332" strokeWidth={2} fillOpacity={1} fill="url(#eggColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-graph">
          <h3>Sales Performance ($)</h3>
          <div className="graph-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sales" fill="#e9c46a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;