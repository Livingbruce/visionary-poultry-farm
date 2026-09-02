import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Save, Trash2 } from 'lucide-react';
import styles from './Manage.module.css';

export default function ManagePopulationForm({ onBack }) {
  const [category, setCategory] = useState('');
  const [recordDate, setRecordDate] = useState(getTodayDate());
  const [entryType, setEntryType] = useState('');
  const [qty, setQty] = useState('');
  const [value, setValue] = useState('');
  const [records, setRecords] = useState([]);

  const rawAmount = Number(qty) * Number(value);
  const amount = isNaN(rawAmount) ? '0.00' : rawAmount.toFixed(2);

  function resetForm() {
    setCategory('');
    setRecordDate(getTodayDate());
    setEntryType('');
    setQty('');
    setValue('');
  }

  useEffect(() => {
    const loaded = loadStoredRecords();
    setRecords(loaded);
  }, []);

  function handleSaveRecord() {
    if (!category || !recordDate || !entryType || !qty || !value) {
      alert("Please fill in all fields before saving.");
      return;
    }

    const newRecord = {
      id: Date.now(),
      category,
      recordDate,
      entryType,
      qty: Number(qty),
      value: Number(value),
      status: 'Draft'
    };

    const updatedRecords = [...records, newRecord];
    localStorage.setItem('population', JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
    alert(`Population record for ${category} saved successfully as draft!`);
    resetForm();
  }

  function handleCommitRecord(record) {
    if (record.status === 'Committed') {
      alert('This record has already been committed.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to commit the ${record.category} record from ${record.recordDate}?`
    );

    if (!confirmed) return;

    const updatedRecords = records.map((rec) =>
      rec.id === record.id ? { ...rec, status: 'Committed' } : rec
    );

    localStorage.setItem('population', JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
    alert('Record successfully committed!');
  }

  function handleDeleteRecord(e, idToDelete) {
    e.stopPropagation();

    const targetRecord = records.find((rec) => rec.id === idToDelete);

    if (targetRecord && targetRecord.status === 'Committed') {
      alert('You are not authorized to delete a committed record.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;

    const updatedRecords = records.filter((rec) => rec.id !== idToDelete);
    localStorage.setItem('population', JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
  }

  function handleCommitFormDirectly() {
    if (!category || !recordDate || !entryType || !qty || !value) {
      alert("Please fill in all fields before committing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to commit the ${category} record directly?`
    );
    if (!confirmed) return;

    const newRecord = {
      id: Date.now(),
      category,
      recordDate,
      entryType,
      qty: Number(qty),
      value: Number(value),
      status: 'Committed'
    };

    const updatedRecords = [...records, newRecord];
    localStorage.setItem('population', JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
    alert('Record successfully saved and committed!');
    resetForm();
  }

  return (
    <div className={styles.page}>
      <div className={styles['page-header']}>
        <button className={styles['back-btn']} onClick={onBack} type="button">
          <ArrowLeft size={18} />
          <span>Back to Population</span>
        </button>
        <h2>Manage Poultry Population Records</h2>
      </div>

      <div className={styles['page-inputs']}>
        {/* Category & Date Picker */}
        <div className={styles.picker}>
          <div className={styles['field-group']}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">--Select Option--</option>
              <option value="Chicken">Chicken</option>
              <option value="Chicks">Chicks</option>
            </select>
          </div>

          <div className={styles['field-group']}>
            <label htmlFor="record-date">As at</label>
            <input
              type="date"
              id="record-date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
            />
          </div>
        </div>

        {/* Inputs Grid */}
        <div className={styles['inputs-row']}>
          <div className={styles['field-group']}>
            <label htmlFor="entry-type">Type</label>
            <select
              id="entry-type"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
            >
              <option value="">--Select Type--</option>
              <option value="Initial Balance">Initial Balance</option>
            </select>
          </div>

          <div className={styles['field-group']}>
            <label htmlFor="qty">Quantity</label>
            <input
              type="number"
              id="qty"
              placeholder="0.00"
              min="0"
              step="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          <div className={styles['field-group']}>
            <label htmlFor="value">Value per Unit</label>
            <input
              type="number"
              id="value"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className={styles['field-group']}>
            <label htmlFor="amount">Estimated Amount</label>
            <input
              type="number"
              id="amount"
              placeholder="0.00"
              value={amount}
              readOnly
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className={styles['btn-section']}>
          <button
            type="button"
            className={styles['btn-danger']}
            onClick={resetForm}
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            type="button"
            className={styles['btn-secondary']}
            onClick={resetForm}
          >
            Clear Form
          </button>
          <button
            type="button"
            className={styles['btn-pri']}
            onClick={handleSaveRecord}
          >
            <Save size={16} /> Save Draft
          </button>
          <button
            type="button"
            className={styles['btn-success']}
            onClick={handleCommitFormDirectly}
          >
            <CheckCircle size={16} /> Commit
          </button>
        </div>
      </div>

      <div className={styles['page-table']}>
        <div className={styles['table-wrapper']}>
          <table className={styles['records-table']}>
            <thead>
              <tr>
                <th style={{ width: "4%" }}>#</th>
                <th style={{ width: "10%" }}>Category</th>
                <th style={{ width: "15%" }}>Date</th>
                <th style={{ width: "10%" }}>Type</th>
                <th style={{ width: "10%" }}>Quantity</th>
                <th style={{ width: "15%" }}>Value per Unit</th>
                <th style={{ width: "15%" }}>Estimated Amount</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "10%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>
                    No records found. Please add a population record.
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => {
                  const estAmount = (rec.qty * rec.value).toFixed(2);
                  const isCommitted = rec.status === 'Committed';

                  return (
                    <tr
                      key={rec.id || idx}
                      className={styles['table-row']}
                      onClick={() => handleCommitRecord(rec)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{idx + 1}</td>
                      <td>{rec.category}</td>
                      <td>{rec.recordDate}</td>
                      <td>{rec.entryType}</td>
                      <td>{rec.qty}</td>
                      <td>{Number(rec.value).toFixed(2)}</td>
                      <td>{estAmount}</td>
                      <td>
                        <span
                          className={
                            isCommitted
                              ? styles['badge-committed']
                              : styles['badge-draft']
                          }
                        >
                          {rec.status || 'Draft'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles['btn-row-action']}
                          onClick={(e) => handleDeleteRecord(e, rec.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function loadStoredRecords() {
  const data = localStorage.getItem('population');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error("Error Fetching Data", e);
      return [];
    }
  }
  return [];
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}