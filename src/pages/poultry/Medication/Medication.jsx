import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './Medication.module.css';

function Medication({ setSelectedCategory }) {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('poultryMedication');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('poultryMedication', JSON.stringify(records));
  }, [records]);

  const totalSickChicken = records
    .filter((record) => record.poultry === 'Chicken' && record.category === 'Under Medication')
    .reduce((sum, record) => sum + (Number(record.quantity) || 0), 0);

  const totalSickChicks = records
    .filter((record) => record.poultry === 'Chicks' && record.category === 'Under Medication')
    .reduce((sum, record) => sum + (Number(record.quantity) || 0), 0);

  function saveNewRecord() {
    const category = document.getElementById('choice')?.value;
    const poultryType = document.getElementById('poultry')?.value;
    const quantity = parseInt(document.getElementById('qty')?.value, 10);
    const medicineType = document.getElementById('med')?.value;
    const recordDate = document.getElementById('ledger-date')?.value;

    if (!category || !poultryType || isNaN(quantity) || !medicineType || !recordDate) {
      alert('Please fill in all fields before saving.');
      return;
    }

    if (editingId) {
      setRecords((prev) =>
        prev.map((rec) =>
          rec.id === editingId
            ? {
                ...rec,
                category,
                poultry: poultryType,
                quantity,
                medicine: medicineType,
                date: recordDate
              }
            : rec
        )
      );
      setEditingId(null);
      alert('Record updated successfully!');
    } else {
      // Save new draft record
      const newRecord = {
        id: Date.now(),
        category,
        poultry: poultryType,
        quantity,
        medicine: medicineType,
        date: recordDate,
        status: 'Draft'
      };
      setRecords((prev) => [...prev, newRecord]);
      alert('Record saved successfully as draft!');
    }

    // Reset input fields
    document.getElementById('choice').value = '';
    document.getElementById('poultry').value = '';
    document.getElementById('qty').value = '';
    document.getElementById('med').value = '';
  }

  function handleEditRecord(recordToEdit) {
    if (recordToEdit.status === 'Committed') {
      alert('You cannot edit a committed record.');
      return;
    }

    setEditingId(recordToEdit.id);
    setSelectedRowId(recordToEdit.id);

    document.getElementById('choice').value = recordToEdit.category;
    document.getElementById('poultry').value = recordToEdit.poultry;
    document.getElementById('qty').value = recordToEdit.quantity;
    document.getElementById('med').value = recordToEdit.medicine;
    document.getElementById('ledger-date').value = recordToEdit.date;
  }

  function handleCommitRecord(recordToCommit) {
    if (!recordToCommit) {
      alert('Please select a draft row from the table to commit.');
      return;
    }

    if (recordToCommit.status === 'Committed') {
      alert('This record has already been committed.');
      return;
    }

    const confirmCommit = window.confirm(
      `Are you sure you want to commit the medication record for ${recordToCommit.poultry} dated ${recordToCommit.date}?`
    );

    if (!confirmCommit) return;

    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.id === recordToCommit.id ? { ...record, status: 'Committed' } : record
      )
    );

    alert('Record successfully committed!');
  }

  function handleDeleteRecord(idToDelete) {
    if (!idToDelete) {
      alert('Please select a record to delete.');
      return;
    }

    const recordToDelete = records.find((record) => record.id === idToDelete);

    if (!recordToDelete) {
      alert('Record not found.');
      return;
    }

    if (recordToDelete.status === 'Committed') {
      alert('You are not authorized to delete a committed record.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this draft record?');
    if (!confirmDelete) return;

    setRecords((prevRecords) => prevRecords.filter((record) => record.id !== idToDelete));

    if (selectedRowId === idToDelete) {
      setSelectedRowId(null);
    }
  }

  function handleRowClick(clickedRecord) {
    setSelectedRowId(clickedRecord.id);

    if (clickedRecord.status === 'Draft') {
      handleCommitRecord(clickedRecord);
    } else if (clickedRecord.status === 'Committed') {
      alert('This record is already committed.');
    }
  }

  const selectedRecord = records.find((record) => record.id === selectedRowId);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => setSelectedCategory(null)}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1>Manage Poultry Medication</h1>
      </div>

      <div className={styles.cardsSection}>
        <div className={styles.card}>
          <h1>Chicken</h1>
          <div className={styles.sickQty}>{totalSickChicken}</div>
          <p>Total Chicken Under Medication</p>
        </div>

        <div className={styles.card}>
          <h1>Chicks</h1>
          <div className={styles.sickQty}>{totalSickChicks}</div>
          <p>Total Chicks Under Medication</p>
        </div>
      </div>

      <div className={styles.pageInputs}>
        <div className={styles.picker}>
          <div className={styles.fieldGroup}>
            <label htmlFor="ledger-date">Date</label>
            <input type="date" id="ledger-date" defaultValue={getTodayDate()} />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="choice">Category</label>
            <select id="choice">
              <option value="">-- Select Status --</option>
              <option value="Under Medication">Under Medication</option>
              <option value="Isolation">Isolation</option>
              <option value="Healed">Healed</option>
            </select>
          </div>
        </div>

        <div className={styles.inputSection}>
          <div className={styles.fieldGroup}>
            <label htmlFor="poultry">Poultry</label>
            <select id="poultry">
              <option value="">-- Select Type --</option>
              <option value="Chicken">Chicken</option>
              <option value="Chicks">Chicks</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="qty">Quantity</label>
            <input type="number" id="qty" placeholder="0" min="0" />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="med">Medicine Type</label>
            <input type="text" id="med" placeholder="e.g. Tylosin" />
          </div>
        </div>

        <div className={styles.btnActions}>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => handleDeleteRecord(selectedRowId)}
          >
            Delete
          </button>
          <button type="button" className={styles.btnPri} onClick={saveNewRecord}>
            {editingId ? 'Update' : 'Save'}
          </button>
          <button
            type="button"
            className={styles.btnSuccess}
            onClick={() => handleCommitRecord(selectedRecord)}
          >
            Commit
          </button>
        </div>
      </div>

      <div className={styles.displaySection}>
        <h1>Poultry Under Medication</h1>

        <div className={styles.tableWrapper}>
          <table className={styles.medicationTable}>
            <thead>
              <tr>
                <th style={{ width: '6%' }}>#</th>
                <th style={{ width: '18%' }}>Category</th>
                <th style={{ width: '14%' }}>Poultry</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '20%' }}>Medicine</th>
                <th style={{ width: '12%' }}>Date</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    No medication records found. Please save a record.
                  </td>
                </tr>
              ) : (
                records.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${styles.tableRow} ${
                      selectedRowId === item.id ? styles.selectedRow : ''
                    }`}
                    onClick={() => handleRowClick(item)}
                  >
                    <td>{index + 1}</td>
                    <td>{item.category}</td>
                    <td>{item.poultry}</td>
                    <td>{item.quantity}</td>
                    <td>{item.medicine}</td>
                    <td>{item.date}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          item.status === 'Committed' ? styles.statusCommitted : styles.statusDraft
                        }`}
                      >
                        {item.status || 'Draft'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.btnSec}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEditRecord(item);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={8}>All poultry under medication records are displayed here</td>
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

export default Medication;