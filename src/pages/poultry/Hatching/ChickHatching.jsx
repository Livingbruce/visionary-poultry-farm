import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './ChickHatching.module.css';

function ChickHatching({ setSelectedCategory }) {
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [records, /* setRecords */] = useState([
    { id: 1, item: 'Eggs', category: 'Eggs Allocated', qty: 150, desc: 'Batch A Incubator', period: '21 Days' },
    { id: 2, item: 'Chicks', category: 'Chicks Hatched', qty: 135, desc: 'Batch A Success', period: '21 Days' },
    { id: 3, item: 'Eggs', category: 'Eggs Disposed', qty: 15, desc: 'Batch A Unhatched', period: '21 Days' },
    { id: 4, item: 'Eggs', category: 'Eggs Allocated', qty: 200, desc: 'Red Hen Brooding', period: '21 Days' },
    { id: 5, item: 'Chicks', category: 'Chicks Hatched', qty: 180, desc: 'Batch B Incubator', period: '21 Days' },
  ]);

  const eggsAllocated = records
    .filter((r) => r.category === 'Eggs Allocated')
    .reduce((sum, r) => sum + Number(r.qty), 0);

  const chicksHatched = records
    .filter((r) => r.category === 'Chicks Hatched')
    .reduce((sum, r) => sum + Number(r.qty), 0);

  const eggsDisposed = records
    .filter((r) => r.category === 'Eggs Disposed')
    .reduce((sum, r) => sum + Number(r.qty), 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => setSelectedCategory(null)}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1>Manage Eggs For Hatching</h1>
      </div>

      <div className={styles.cardsSection}>
        <div className={styles.card}>
          <h1>Eggs Allocated</h1>
          <div className={styles.statValue}>{eggsAllocated}</div>
          <p>All Eggs Allocated For Hatching.</p>
        </div>

        <div className={styles.card}>
          <h1>Eggs Hatched</h1>
          <div className={styles.statValue}>{chicksHatched}</div>
          <p>Eggs Successfully Hatched.</p>
        </div>

        <div className={styles.card}>
          <h1>Eggs Disposed</h1>
          <div className={styles.statValue}>{eggsDisposed}</div>
          <p>All Eggs That Failed To Hatch.</p>
        </div>
      </div>

      <div className={styles.pageInputs}>
        <div className={styles.picker}>
          <div className={styles.fieldGroup}>
            <label htmlFor="date">Date</label>
            <input type="date" id="date" defaultValue={getTodayDate()} />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="item">Item</label>
            <select id="item">
              <option value="">-- Select Option --</option>
              <option value="Eggs">Eggs</option>
              <option value="Chicks">Chicks</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="category">Category</label>
            <select id="category">
              <option value="">-- Select Option --</option>
              <option value="Eggs Allocated">Eggs Allocation</option>
              <option value="Chicks Hatched">Chicks Hatched</option>
              <option value="Eggs Disposed">Eggs Disposed</option>
            </select>
          </div>
        </div>

        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label htmlFor="qty">Quantity</label>
            <input type="number" id="qty" placeholder="0.00" min="0" />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="desc">Description</label>
            <input type="text" id="desc" placeholder="e.g. Red hen incubating" />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="incubation-days">Incubation Days</label>
            <input type="number" id="incubation-days" placeholder="21" />
          </div>
        </div>

        <div className={styles.btnActions}>
          <button type="button" className={styles.btnDanger}>Delete</button>
          <button type="button" className={styles.btnPri}>Save</button>
          <button type="button" className={styles.btnSuccess}>Commit</button>
        </div>
      </div>

      <div className={styles.displaySection}>
        <h1>Hatching & Allocation Ledger</h1>

        <div className={styles.tableWrapper}>
          <table className={styles.hatchTable}>
            <thead>
              <tr>
                <th style={{ width: '6%' }}>#</th>
                <th style={{ width: '13%' }}>Item</th>
                <th style={{ width: '18%' }}>Category</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '25%' }}>Description</th>
                <th style={{ width: '16%' }}>Incubation Period</th>
                <th style={{ width: '12%' }}>Action</th>
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
                  <td>{item.item}</td>
                  <td>{item.category}</td>
                  <td>{item.qty}</td>
                  <td>{item.desc}</td>
                  <td>{item.period}</td>
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
                <td colSpan={7}>All eggs allocated for hatching displayed here.</td>
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

export default ChickHatching;