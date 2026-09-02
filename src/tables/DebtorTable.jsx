import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../styles/DebtorTable.css';

function DebtorTable({ setSelectedCategory, selectedCategory }) {

  useEffect(() => {
    initializeTable();
  }, []);

  return (
    <div className="page transactions-container">
      <div className="table-view-header">
        <button
          className="back-btn"
          onClick={() => setSelectedCategory && setSelectedCategory(null)}
        >
          <ArrowLeft size={18} />
          <span>Back to Transactions</span>
        </button>
        <h1>{(selectedCategory || 'debtor').toUpperCase()} Ledger Table</h1>
      </div>

      <div className="table-placeholder-card">
        <div className="debtor-header">
          <div className="header-left">
            <label>Ledger No</label>
            <button className="ledger-btn" id="ledgerBtn">D00001</button>
          </div>

          <div className="header-right">
            <label>Date</label>
            <input type="date" id="ledger-date" />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="debtor-table" id="debtor-table">
            <thead>
              <tr>
                <th style={{ width: "4%" }}>#</th>
                <th style={{ width: "15%" }}>Item / Details</th>
                <th style={{ width: "7%" }}>Qty</th>
                <th style={{ width: "15%" }}>Debtor / Customer</th>
                <th style={{ width: "13%" }}>Settlement Type</th>
                <th style={{ width: "10%" }}>Voucher No.</th>
                <th style={{ width: "18%" }}>Description</th>
                <th style={{ width: "9%" }}>Debit (Owed)</th>
                <th style={{ width: "9%" }}>Credit (Paid)</th>
              </tr>
            </thead>
            <tbody id="ledgerBody"></tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>Net Accounts Receivable:</td>
                <td id="TotalDr" style={{ fontWeight: 'bold' }}>0.00</td>
                <td id="TotalCr" style={{ fontWeight: 'bold' }}>0.00</td>
                <td id="TotalBal" style={{ fontWeight: 'bold' }}>0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="footer-actions">
          <button id="BtnDeleteLine" className="btn-sec">Delete Line</button>
          <button id="BtnNewLedger" className="btn-sec">New Ledger</button>
          <button id="BtnSettle" className="btn-pri">Settle Selected</button>
          <button id="BtnAddNew" className="btn-pri">Add Row</button>
          <button id="BtnSave" className="btn-pri">Save</button>
          <button id="BtnCommit" className="btn-success">Commit</button>
        </div>
      </div>
    </div>
  );
}

function initializeTable() {
  seedInitialRows(5);
}

function CreateTableRows(index, data = {}, isLocked = false, source = "manual", dbId = null, salesId = null) {
  const tr = document.createElement('tr');

  tr.dataset.source = source;
  if (dbId) tr.dataset.dbId = dbId;
  if (salesId) tr.dataset.salesId = salesId;

  if (source === "sales") tr.classList.add('debt-sales-row');

  tr.addEventListener('click', () => {
    if (!isLocked) {
      document.querySelectorAll('#ledgerBody tr').forEach(r => r.classList.remove('selected-row'));
      tr.classList.add('selected-row');
    }
  });

  const d = {
    item: data.item || "",
    qty: data.qty || "",
    debtor: data.debtor || "",
    type: data.type || "",
    voucher: data.voucher || "",
    desc: data.desc || "",
    dr: data.dr || "",
    cr: data.cr || "",
  };

  const disabled = isLocked ? "disabled" : "";

  tr.innerHTML = `
    <td>${index}</td>
    <td><input type="text" class="row-item" value="${d.item}" ${disabled}></td>
    <td><input type="number" class="row-qty" value="${d.qty}" ${disabled}></td>
    <td><input type="text" class="row-name" value="${d.debtor}" ${disabled}></td>
    <td>
      <select class="row-type" ${disabled}>
        <option value="" ${d.type === "" ? "selected" : ""}></option>
        <option value="Cash" ${d.type === "Cash" ? "selected" : ""}>Cash</option>
        <option value="M-Pesa" ${d.type === "M-Pesa" ? "selected" : ""}>M-Pesa</option>
        <option value="Bank" ${d.type === "Bank" ? "selected" : ""}>Bank</option>
        <option value="Eggs" ${d.type === "Eggs" ? "selected" : ""}>Eggs (In-Kind)</option>
        <option value="Chicken" ${d.type === "Chicken" ? "selected" : ""}>Chicken (In-Kind)</option>
        <option value="Chick" ${d.type === "Chick" ? "selected" : ""}>Chick (In-Kind)</option>
        <option value="Manure" ${d.type === "Manure" ? "selected" : ""}>Manure (In-Kind)</option>
        <option value="Credit" ${d.type === "Credit" ? "selected" : ""}>Credit</option>
      </select>
    </td>
    <td><input type="text" class="row-voucher" value="${d.voucher}" ${disabled}></td>
    <td><input type="text" class="row-desc" value="${d.desc}" ${source === "sales" ? "disabled" : disabled}></td>
    <td><input type="number" class="row-dr" value="${d.dr}" ${disabled}></td>
    <td><input type="number" class="row-cr" value="${d.cr}" ${disabled}></td>
  `;

  return tr;
}

function seedInitialRows(count = 5) {
  const tbody = document.getElementById('ledgerBody');
  if (!tbody) return;
  tbody.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    tbody.appendChild(CreateTableRows(i, {}, false, "manual"));
  }
}

export default DebtorTable;