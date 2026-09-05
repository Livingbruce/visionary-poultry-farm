import { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, Trash2 } from 'lucide-react';
import styles from './ManageHouses.module.css';

const CATEGORIES = [
  { value: 'Construction', label: 'Construction' },
  { value: 'Demolition', label: 'Demolition' },
  { value: 'Existing', label: 'Existing' },
  { value: 'label House', label: 'Label Houses' },
  { value: 'Maintainace', label: 'Maintainace' },
];

function ManageHousesForm({ onBack }) {
  const [category, setCategory] = useState('');
  const [recordDate, setRecordDate] = useState(getTodayDate());
  const [houses, setHouses] = useState(() => loadHouses());

  const [buildCount, setBuildCount] = useState('');
  const [buildNames, setBuildNames] = useState([]);

  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    localStorage.setItem('poultryHouses', JSON.stringify(houses));
  }, [houses]);

  useEffect(() => {
    setBuildCount('');
    setBuildNames([]);
    setSelectedHouseId('');
    setNewLabel('');
  }, [category]);

  const activeHouses = houses.filter((h) => h.status === 'Active');
  const maintenanceCount = houses.filter((h) => h.status === 'Under Maintenance').length;
  const demolishedCount = houses.filter((h) => h.status === 'Demolished').length;

  function handleBuildCountChange(e) {
    const n = Math.max(0, Math.min(50, parseInt(e.target.value, 10) || 0));
    setBuildCount(e.target.value);
    setBuildNames((prev) => {
      const next = prev.slice(0, n);
      while (next.length < n) next.push('');
      return next;
    });
  }

  function handleBuildNameChange(index, value) {
    setBuildNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleSave() {
    if (category === 'Construction') {
      if (buildNames.length === 0 || buildNames.some((n) => !n.trim())) {
        alert('Please enter a label for every house being constructed.');
        return;
      }
      const additions = buildNames.map((name) => ({
        id: Date.now() + Math.random(),
        name: name.trim(),
        status: 'Active',
        dateAdded: recordDate,
      }));
      setHouses((prev) => [...prev, ...additions]);
      alert(`${additions.length} house(s) added.`);
      setBuildCount('');
      setBuildNames([]);
      return;
    }

    if (category === 'Demolition') {
      if (!selectedHouseId) {
        alert('Please select a house to demolish.');
        return;
      }
      if (!window.confirm('Demolish the selected house? This cannot be undone.')) return;
      setHouses((prev) =>
        prev.map((h) => (h.id === selectedHouseId ? { ...h, status: 'Demolished' } : h))
      );
      setSelectedHouseId('');
      return;
    }

    if (category === 'Maintainace') {
      if (!selectedHouseId) {
        alert('Please select a house to place under maintenance.');
        return;
      }
      setHouses((prev) =>
        prev.map((h) => (h.id === selectedHouseId ? { ...h, status: 'Under Maintenance' } : h))
      );
      setSelectedHouseId('');
      return;
    }

    if (category === 'label House') {
      if (!selectedHouseId || !newLabel.trim()) {
        alert('Please select a house and enter a new label.');
        return;
      }
      setHouses((prev) =>
        prev.map((h) => (h.id === selectedHouseId ? { ...h, name: newLabel.trim() } : h))
      );
      setSelectedHouseId('');
      setNewLabel('');
    }
  }

  function handleRestore(id) {
    setHouses((prev) => prev.map((h) => (h.id === id ? { ...h, status: 'Active' } : h)));
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this house record permanently?')) return;
    setHouses((prev) => prev.filter((h) => h.id !== id));
  }

  const saveDisabled = !category || category === 'Existing';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={onBack} type="button">
          <ArrowLeft size={18} />
          <span>Back to Population</span>
        </button>
        <h2>Manage Poultry House Records</h2>
      </div>

      {/* Stat Summary */}
      <div className={styles.cardsSection}>
        <div className={styles.card}>
          <h1>Active Houses</h1>
          <div className={styles.statValue}>{activeHouses.length}</div>
          <p>Currently standing chicken houses</p>
        </div>
        <div className={styles.card}>
          <h1>Under Maintenance</h1>
          <div className={styles.statValue}>{maintenanceCount}</div>
          <p>Houses temporarily out of use</p>
        </div>
        <div className={styles.card}>
          <h1>Demolished</h1>
          <div className={styles.statValue}>{demolishedCount}</div>
          <p>Houses no longer in the farm</p>
        </div>
      </div>

      <div className={styles.pageInputs}>
        {/* Category & Date Picker */}
        <div className={styles.picker}>
          <div className={styles.fieldGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">--Select Option--</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="record-date">As at</label>
            <input
              type="date"
              id="record-date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Inputs, driven by category */}
        <div className={styles.inputsRow}>
          {category === 'Construction' && (
            <>
              <div className={styles.fieldGroup}>
                <label htmlFor="build-count">Number of Houses to Build</label>
                <input
                  type="number"
                  id="build-count"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={buildCount}
                  onChange={handleBuildCountChange}
                />
              </div>
              {buildNames.map((name, i) => (
                <div className={styles.fieldGroup} key={i}>
                  <label htmlFor={`house-name-${i}`}>House {i + 1} Label</label>
                  <input
                    type="text"
                    id={`house-name-${i}`}
                    placeholder={`e.g. House ${activeHouses.length + i + 1}`}
                    value={name}
                    onChange={(e) => handleBuildNameChange(i, e.target.value)}
                  />
                </div>
              ))}
            </>
          )}

          {category === 'Demolition' && (
            <div className={styles.fieldGroup}>
              <label htmlFor="demolish-house">Select House to Demolish</label>
              <select
                id="demolish-house"
                value={selectedHouseId}
                onChange={(e) => setSelectedHouseId(e.target.value)}
              >
                <option value="">-- Select House --</option>
                {activeHouses.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              {activeHouses.length === 0 && (
                <p className={styles.emptyHint}>No active houses available.</p>
              )}
            </div>
          )}

          {category === 'Maintainace' && (
            <div className={styles.fieldGroup}>
              <label htmlFor="maintain-house">Select House Under Maintenance</label>
              <select
                id="maintain-house"
                value={selectedHouseId}
                onChange={(e) => setSelectedHouseId(e.target.value)}
              >
                <option value="">-- Select House --</option>
                {activeHouses.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              {activeHouses.length === 0 && (
                <p className={styles.emptyHint}>No active houses available.</p>
              )}
            </div>
          )}

          {category === 'label House' && (
            <>
              <div className={styles.fieldGroup}>
                <label htmlFor="label-house">Select House</label>
                <select
                  id="label-house"
                  value={selectedHouseId}
                  onChange={(e) => setSelectedHouseId(e.target.value)}
                >
                  <option value="">-- Select House --</option>
                  {activeHouses.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="new-label">New Label</label>
                <input
                  type="text"
                  id="new-label"
                  placeholder="e.g. House A"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
            </>
          )}

          {category === 'Existing' && (
            <p className={styles.emptyHint}>
              Existing houses are listed in the table below.
            </p>
          )}

          {!category && (
            <p className={styles.emptyHint}>
              Select a category above to see the relevant inputs.
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className={styles.btnSection}>
          <button
            type="button"
            className={styles.btnPri}
            onClick={handleSave}
            disabled={saveDisabled}
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {/* Houses Table */}
      <div className={styles.displaySection}>
        <h2>House Records</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.housesTable}>
            <thead>
              <tr>
                <th style={{ width: '6%' }}>#</th>
                <th style={{ width: '32%' }}>Label</th>
                <th style={{ width: '20%' }}>Status</th>
                <th style={{ width: '20%' }}>Date Added</th>
                <th style={{ width: '22%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {houses.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyTableMsg}>
                    No house records yet. Use the form above to add one.
                  </td>
                </tr>
              ) : (
                houses.map((h, i) => (
                  <tr key={h.id} className={styles.tableRow}>
                    <td>{i + 1}</td>
                    <td>{h.name}</td>
                    <td>
                      <span
                        className={
                          h.status === 'Active'
                            ? styles.badgeActive
                            : h.status === 'Under Maintenance'
                            ? styles.badgeMaintenance
                            : styles.badgeDemolished
                        }
                      >
                        {h.status}
                      </span>
                    </td>
                    <td>{h.dateAdded}</td>
                    <td>
                      {h.status !== 'Active' && (
                        <button
                          type="button"
                          className={styles.btnRowAction}
                          onClick={() => handleRestore(h.id)}
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.btnRowAction}
                        onClick={() => handleDelete(h.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function loadHouses() {
  const data = localStorage.getItem('poultryHouses');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error loading houses', e);
      return [];
    }
  }
  return [];
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export default ManageHousesForm;