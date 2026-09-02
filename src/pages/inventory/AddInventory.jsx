import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import '../../styles/AddInventory.css';

export default function AddInventory({ onBack, onAddRecord }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [commodity, setCommodity] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [narration, setNarration] = useState('');

  const [stagedRows, setStagedRows] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddRow = (e) => {
    e.preventDefault();
    if (!commodity || !description || !quantity) {
      setErrorMsg('Please select a commodity, description, and quantity.');
      return;
    }

    setErrorMsg('');

    const newRow = {
      id: Date.now(),
      date,
      commodity,
      description,
      quantity: Number(quantity),
      narration: narration || `${description} for ${commodity}`,
    };

    setStagedRows((prev) => [...prev, newRow]);

    setCommodity('');
    setDescription('');
    setQuantity('');
    setNarration('');
  };

  const handleDeleteSelected = () => {
    if (!selectedRowId) return;
    setStagedRows((prev) => prev.filter((row) => row.id !== selectedRowId));
    setSelectedRowId(null);
  };

  const handleCommit = () => {
    if (stagedRows.length === 0) {
      setErrorMsg('No entries to commit. Add at least one row first.');
      return;
    }

    stagedRows.forEach((row) => {
      const unitMap = {
        Eggs: 'pcs',
        Kienyeji: 'birds',
        Layers: 'birds',
        'Chick Mash': 'kg',
        'Starter Cramps': 'kg',
        'Farm Feeds': 'kg',
        Manure: 'bags',
      };

      const isAddition =
        row.description === 'Initial Balance' ||
        row.description === 'Daily Collection Laid';

      const prefix = isAddition ? '+' : '-';
      const unit = unitMap[row.commodity] || 'units';

      onAddRecord({
        item: row.commodity,
        action: row.description,
        qty: `${prefix}${row.quantity} ${unit}`,
        desc: row.narration,
        rawQty: row.quantity,
        date: row.date,
      });
    });

    onBack();
  };

  return (
    <div className="add-inventory-container">
      {/* Page Header */}
      <div className="add-inventory-header">
        <button id="back" className="btn-back" onClick={onBack} type="button">
          <ArrowLeft size={18} />
          <span>Back to Inventory</span>
        </button>
        <h1>Add New Inventory Entry</h1>
      </div>

      {/* Input Card Container */}
      <div className="input-card">
        {errorMsg && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddRow}>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="dateTime">Date</label>
              <input
                type="date"
                id="dateTime"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="commodity">Commodity</label>
              <select
                id="commodity"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                required
              >
                <option value="">-- Select Option --</option>
                <option value="Eggs">Eggs</option>
                <option value="Kienyeji">Kienyeji</option>
                <option value="Layers">Layers</option>
                <option value="Chick Mash">Chick Mash</option>
                <option value="Starter Cramps">Starter Cramps</option>
                <option value="Farm Feeds">Farm Feeds</option>
                <option value="Manure">Manure</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="description">Description (Action Type)</label>
              <select
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              >
                <option value="">-- Select Option --</option>
                <option value="Initial Balance">Initial Balance</option>
                <option value="Daily Collection Laid">Daily Collection Laid</option>
                <option value="Disposal">Disposal</option>
                <option value="Self Consumed / Drawings">
                  Self Consumed / Drawings
                </option>
                <option value="Used to Feed Poultry">Used to Feed Poultry</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="qty">Quantity</label>
              <input
                type="number"
                id="qty"
                placeholder="0.00"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="input-group full-width">
              <label htmlFor="narration">Narration / Notes</label>
              <input
                type="text"
                id="narration"
                placeholder="e.g. Morning collection from Coop 2"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                disabled
              />
            </div>
          </div>

          <div className="btn-actions">
            <button type="submit" id="save" className="btn-pri">
              <Plus size={16} />
              <span>Add Row</span>
            </button>
            <button
              type="button"
              id="commit"
              className="btn-success"
              onClick={handleCommit}
            >
              <CheckCircle size={16} />
              <span>Commit ({stagedRows.length})</span>
            </button>
            <button
              type="button"
              id="delete"
              className="btn-danger"
              disabled={!selectedRowId}
              onClick={handleDeleteSelected}
            >
              <Trash2 size={16} />
              <span>Delete Selected</span>
            </button>
          </div>
        </form>
      </div>

      {/* Staged Inventory Table */}
      <div className="table-card">
        <h2>Staged Inventory Entries</h2>
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '15%' }}>Commodity</th>
                <th style={{ width: '22%' }}>Action Type</th>
                <th style={{ width: '12%' }}>Quantity</th>
                <th style={{ width: '36%' }}>Narration</th>
                <th style={{ width: '10%' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stagedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    No items staged. Use the form above to add rows.
                  </td>
                </tr>
              ) : (
                stagedRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`table-row ${
                      selectedRowId === row.id ? 'selected-row' : ''
                    }`}
                    onClick={() => setSelectedRowId(row.id)}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <span className="badge badge-item">{row.commodity}</span>
                    </td>
                    <td>
                      <span className="badge badge-action">{row.description}</span>
                    </td>
                    <td className="qty-num">{row.quantity}</td>
                    <td>{row.narration}</td>
                    <td>{row.date}</td>
                  </tr>
                ))
              )}
            </tbody>
            {stagedRows.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6}>
                    Total Staged Rows: <strong>{stagedRows.length}</strong>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}