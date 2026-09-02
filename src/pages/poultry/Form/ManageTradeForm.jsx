import { ArrowLeft } from 'lucide-react';
import styles from './Trade.module.css';

function ManageTradeForm({ onBack }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back to Population</span>
        </button>
        <h2>Manage Buying & Selling Records</h2>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.tradeTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th className={styles.numCol}>Qty</th>
              <th>Type</th>
              <th>Description</th>
              <th>Date</th>
              <th className={styles.numCol}>Price/Unit</th>
              <th className={styles.numCol}>Buy Total</th>
              <th className={styles.numCol}>Sell Total</th>
            </tr>
          </thead>
          <tbody id="ledgerBody">
            {/* Database rows dynamically injected here */}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className={styles.totalLabel}>Total Ledger Summary</td>
              <td id="pricePerUnit" className={styles.numCol}>0.00</td>
              <td id="buyPrice" className={styles.numCol}>0.00</td>
              <td id="sellPrice" className={styles.numCol}>0.00</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default ManageTradeForm;