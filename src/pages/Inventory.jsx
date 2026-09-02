import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import '../styles/Inventory.css';
import { inventoryData } from '../components/inventoryCards';
import AddInventory from './inventory/AddInventory';

export default function Inventory() {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [ledgerRecords, setLedgerRecords] = useState([
    {
      id: 1,
      item: 'Eggs',
      action: 'Collection',
      qty: '+340 pcs',
      desc: 'Morning egg collection (House A & B)',
      eggsBal: 1240,
      manureBal: 45,
      feedBal: 850,
    },
    {
      id: 2,
      item: 'Feed',
      action: 'Usage',
      qty: '-120 kg',
      desc: 'Layers mash fed to House A',
      eggsBal: 1240,
      manureBal: 45,
      feedBal: 730,
    },
    {
      id: 3,
      item: 'Manure',
      action: 'Collection',
      qty: '+15 bags',
      desc: 'Weekly coop cleaning & bagging',
      eggsBal: 1240,
      manureBal: 60,
      feedBal: 730,
    },
    {
      id: 4,
      item: 'Eggs',
      action: 'Sale',
      qty: '-300 pcs',
      desc: 'Sold 10 trays to local wholesale buyer',
      eggsBal: 940,
      manureBal: 60,
      feedBal: 730,
    },
    {
      id: 5,
      item: 'Feed',
      action: 'Purchase',
      qty: '+500 kg',
      desc: 'Restocked 10 bags of Grower mash from supplier',
      eggsBal: 940,
      manureBal: 60,
      feedBal: 1230,
    },
  ]);

  const handleAddRecord = (newEntry) => {
    setLedgerRecords((prev) => [...prev, newEntry]);
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <AddInventory 
        onBack={() => setIsAdding(false)} 
        onAddRecord={handleAddRecord}
      />
    );
  }

  return (
    <div className="page inventory-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-text">
          <h1>Poultry Farm Inventory</h1>
          <p>egg collections, feed stocks, and Manure collections.</p>
        </div>

        <div className="button-case">
          <button 
            className="button primary-btn" 
            id="inventory-table-add"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={18} />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="page-cards inventory-grid">
        {inventoryData.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className={`card inventory-card ${item.colorClass || ''}`}>
              <div className="card-header">
                <h2>{item.title}</h2>
                <div className="card-icon-wrapper">
                  <Icon size={20} />
                </div>
              </div>

              <div className="card-body">
                <div className="card-content" id={item.id}>
                  <span className="metric-value">{item.value}</span>
                  <span className="metric-unit">{item.unit}</span>
                </div>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer Button */}
      <div className="inventory-actions">
        <button className="button secondary-btn" id="inventory-table-update">
          <RefreshCw size={18} />
          <span>Update Inventory</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="header">
          <label htmlFor="ledgerDate">Date</label>
          <input type="date" id="ledgerDate" defaultValue={getTodayDate()} />
        </div>

        <div className="inventory-table">
          <table className="table-wrapper">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>#</th>
                <th style={{ width: '12%' }}>Commodity Item</th>
                <th style={{ width: '12%' }}>Action Type</th>
                <th style={{ width: '11%' }}>Quantity</th>
                <th style={{ width: '32%' }}>Description</th>
                <th style={{ width: '9%' }}>Eggs Bal</th>
                <th style={{ width: '9%' }}>Manure Bal</th>
                <th style={{ width: '9%' }}>Feed Bal</th>
              </tr>
            </thead>
            <tbody>
              {ledgerRecords.map((row, index) => (
                <tr
                  key={row.id}
                  className={`table-row ${selectedRowId === row.id ? 'selected-row' : ''}`}
                  onClick={() => setSelectedRowId(row.id)}
                >
                  <td>{index + 1}</td>
                  <td>
                    <span className="badge badge-item">{row.item}</span>
                  </td>
                  <td>
                    <span className={`badge badge-type ${row.action.toLowerCase()}`}>
                      {row.action}
                    </span>
                  </td>
                  <td className="balance-num">{row.qty}</td>
                  <td>{row.desc}</td>
                  <td className="balance-num">{row.eggsBal.toLocaleString()} pcs</td>
                  <td className="balance-num">{row.manureBal.toLocaleString()} bags</td>
                  <td className="balance-num">{row.feedBal.toLocaleString()} kg</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={8}>All Inventory Ledger Transactions For The Month.</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}