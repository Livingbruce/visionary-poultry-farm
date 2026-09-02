import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './Mortality.module.css';

function Mortality({ setSelectedCategory }) {
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [records, /* setRecords */] = useState([
    { id: 1, poultry: 'Chicken', qty: 3, date: '2026-08-25', desc: 'Severe heat stress' },
    { id: 2, poultry: 'Chicks', qty: 5, date: '2026-08-26', desc: 'Chilling due to rain' },
    { id: 3, poultry: 'Chicken', qty: 2, date: '2026-08-27', desc: 'Coccidiosis complications' },
    { id: 4, poultry: 'Chicks', qty: 4, date: '2026-08-28', desc: 'Sickness in coop 2' },
  ]);

  const chickenDead = records
    .filter((r) => r.poultry === 'Chicken')
    .reduce((sum, r) => sum + Number(r.qty), 0);

  const chickDead = records
    .filter((r) => r.poultry === 'Chicks')
    .reduce((sum, r) => sum + Number(r.qty), 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => setSelectedCategory(null)}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1>Track Mortality Records</h1>
      </div>

      <div className={styles.cardsSection}>
        <div className={styles.card}>
          <h1>Chicken Mortality</h1>
          <div className={styles.statValue}>{chickenDead}</div>
          <p>Total Record Of All Deceased Chicken.</p>
        </div>

        <div className={styles.card}>
          <h1>Chick Mortality</h1>
          <div className={styles.statValue}>{chickDead}</div>
          <p>Total Record Of All Deceased Chicks.</p>
        </div>
      </div>

      <div className={styles.pageInputs}>
        <div className={styles.picker}>
          <div className={styles.fieldGroup}>
            <label htmlFor="poultry">Poultry</label>
            <select id="poultry">
              <option value="">-- Select --</option>
              <option value="Chicken">Chicken</option>
              <option value="Chicks">Chicks</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="date">Date</label>
            <input type="date" id="date" defaultValue={getTodayDate()} />
          </div>
        </div>

        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label htmlFor="qty">Quantity</label>
            <input type="number" id="qty" placeholder="0" min="0" />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="desc">Description</label>
            <input type="text" id="desc" placeholder="Due to sickness" />
          </div>
        </div>

        <div className={styles.btnActions}>
          <button type="button" className={styles.btnDanger}>Delete</button>
          <button type="button" className={styles.btnPri}>Save</button>
          <button type="button" className={styles.btnSuccess}>Commit</button>
        </div>
      </div>

      <div className={styles.displaySection}>
        <h1>Mortality Ledger</h1>

        <div className={styles.tableWrapper}>
          <table className={styles.mortalityTable}>
            <thead>
              <tr>
                <th style={{ width: '6%' }}>#</th>
                <th style={{ width: '15%' }}>Poultry</th>
                <th style={{ width: '12%' }}>Quantity</th>
                <th style={{ width: '15%' }}>Date</th>
                <th style={{ width: '40%' }}>Description</th>
                <th style={{ width: '12%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${styles.tableRow} ${selectedRowId === item.id ? styles.selectedRow : ''}`}
                  onClick={() => setSelectedRowId(item.id)}
                >
                  <td>{index + 1}</td>
                  <td>{item.poultry}</td>
                  <td>{item.qty}</td>
                  <td>{item.date}</td>
                  <td>{item.desc}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnSec}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6}>All Fatalities in the farm displayed here.</td>
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

export default Mortality;