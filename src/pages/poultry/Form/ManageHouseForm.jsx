import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './ManageHouses.module.css';

function ManageHousesForm({ onBack }) {

  useEffect(() => {
    Initialize();
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back to Population</span>
        </button>
        <h2>Manage Poultry House Records</h2>
      </div>

      <div className={styles.pageInputs}>
        {/* Category & Date Picker */}
        <div className={styles.picker}>
          <div className={styles.fieldGroup}>
            <label htmlFor="category">Category</label>
            <select id="category">
              <option value="">--Select Option--</option>
              <option value="Construction">Construction</option>
              <option value="Demolition">Demolition</option>
              <option value="Existing">Existing</option>
              <option value="label House">Label Houses</option>
              <option value="Maintainace">Maintainace</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="record-date">As at</label>
            <input type="date" id="record-date" value={getTodayDate()} />
          </div>
        </div>

        {/* Inputs Grid */}
        <div id="inputDisplay" className={styles.inputsRow}></div>

        {/* Action Controls */}
        <div className={styles.btnSection}>
          <button type="button" className={styles.btnDanger}>Delete</button>
          <button type="button" className={styles.btnPri} id="save">Save Draft</button>
          <button type="button" className={styles.btnSuccess}>Commit</button>
        </div>
      </div>
    </div>
  );
}

function Initialize() {
  document.getElementById('save').addEventListener('click', SaveData);

  const category = document.getElementById('category');
  category.addEventListener('change', (e) => {
    if (e.target.value === 'Construction') {
      ParseInput(e);
    } else if (e.target.value === 'Existing') {
      ParseInput(e);
    }
  });
}

function ParseInput() {
  const display = document.getElementById('inputDisplay');
  const category = document.getElementById('category').value;

  if (!display) {
    alert("Failed to load page. Please contact your IT administrator");
    return;
  }

  if (category === "Construction") {
    display.innerHTML = `
      <div className={styles.fieldGroup} id="typeSet">
        <label htmlFor="entry-type">Type</label>
        <select id="entry-type">
          <option value="">--Select Type--</option>
          <option value="Initial">Existing House(s)</option>
          <option value="New House">New House(s)</option>
          <option value="New Room">New Room</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="qty">Number of Buildings</label>
        <input type="number" id="qty" placeholder="0.00" min="0" step="1" />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="value">Value per Unit</label>
        <input type="number" id="value" placeholder="0.00" min="0" step="0.01" />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="amount">Estimated Amount</label>
        <input type="number" id="amount" placeholder="0.00" disabled />
      </div>
    `;
  } else if (category === 'Existing') {
    display.innerHTML = `
      <h1>Hello there!</h1>
    `;
  }
}

function SaveData() {
  

}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export default ManageHousesForm;