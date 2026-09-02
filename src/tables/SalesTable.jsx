import {useEffect} from 'react';
import { ArrowLeft } from 'lucide-react';
import '../styles/SalesTable.css';

const VOUCHER_MAP = {
  "Cash": "01",
  "M-pesa": "02",
  "Debt": "03",
  "Bank": "04",
  "Clear Credit": "05",
  "Gift": "06",
};

// SalesTable Component
function SalesTable({setSelectedCategory, selectedCategory}) {
  useEffect(() => {
    initializeTable();
  }, []);

  return (
      <div className="page transactions-container">
        <div className="table-view-header">
          <button 
            className="back-btn" 
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft size={18} />
            <span>Back to Transactions</span>
          </button>
          <h1>{(selectedCategory || 'purchases').toUpperCase()} Ledger Table</h1>
        </div>
        <div className="table-placeholder-card">
          <div className="sales-header">
            <div className="header-left">
              <label>Ledger No:</label>
              <button className="ledger-btn">S00001</button>
            </div>
  
            <div className="header-right">
              <label>Date</label>
              <input type="date" id="ledger-date" defaultValue={getTodayDate()}></input>
            </div>
          </div>
  
          <div className="table-wrapper">
            <table className="sales-table" id="sales-table">
              <thead>
                <tr>
                  <th style={{width: "4%"}}>#</th>
                  <th style={{width: "14%"}}>Item</th>
                  <th style={{width: "10%"}}>Quantity</th>
                  <th style={{width: "12%"}}>Type</th>
                  <th style={{width: "10%"}}>Voucher No</th>
                  <th style={{width: "14%"}}>Customer</th>
                  <th style={{width: "20%"}}>Description</th>
                  <th style={{width: "16%"}}>Amount</th>
                </tr>
              </thead>
              <tbody id="ledgerBody"></tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Balance:</td>
                  <td id="total" style={{ fontWeight: 'bold' }}>0.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
  
          <div className="footer-actions">
            <button id="deleteLineBtn" className="btn-sec">Delete Line</button>
            <button id="AddLineBtn" className="btn-sec">+ Add Line</button>
            <button id="newLedgerBtn" className="btn-pri">New Ledger</button>
            <button id="saveBtn" className="btn-pri">Save</button>
            <button id="commitBtn" className="btn-success">Commit</button>
            <button id="cancelBtn" className="btn-danger">Cancel</button>
          </div>
        </div>
      </div>
    );
}

// I N I T I A L I Z E  Table
function initializeTable() {
  const body = document.getElementById('ledgerBody');
  if (body) {
    body.removeEventListener('input', handleTableInteractions);
    body.removeEventListener('change', handleTableInteractions);
    body.addEventListener('input', handleTableInteractions);
    body.addEventListener('change', handleTableInteractions);
  }

  seedInitialRows(5);
}

// C R E A T E  Table Rows
function createTableRow(index, data = {}, isLocked = false) {
  const tr = document.createElement('tr');
  tr.addEventListener('click', () => {
    if (!isLocked) {
      document.querySelectorAll('#ledgerBody tr').forEach(r => r.classList.remove('selected-row'));
      tr.classList.add('selected-row');
    }
  });

  const d = {
    item: data.item || "",
    qty: data.qty || "",
    type: data.type || "",
    voucher: data.voucher || "",
    to: data.to || "",
    desc: data.desc || "",
    amount: data.amount || ""
  };

  const disabled = isLocked ? "disabled" : "";

  tr.innerHTML = `
    <td>${index}</td>
    <td>
      <select class="row-item" ${disabled}>
        <option value="" ${d.item === "" ? "selected" : ""}></option>
        <option value="Chicken" ${d.item === "Chicken" ? "selected" : ""}>Chicken</option>
        <option value="Chick" ${d.item === "Chick" ? "selected" : ""}>Chick</option>
        <option value="Manure" ${d.item === "Manure" ? "selected" : ""}>Manure</option>
        <option value="Eggs" ${d.item === "Eggs" ? "selected" : ""}>Eggs</option>
      </select>
    </td>
    <td><input type="number" class="row-qty" value="${d.qty}" onwheel="this.blur()" ${disabled}></td>
    <td>
      <select class="row-type" ${disabled}>
        <option value="" ${d.type === "" ? "selected" : ""}></option>
        <option value="M-pesa" ${d.type === "M-pesa" ? "selected" : ""}>M-pesa</option>
        <option value="Cash" ${d.type === "Cash" ? "selected" : ""}>Cash</option>
        <option value="Bank" ${d.type === "Bank" ? "selected" : ""}>Bank</option>
        <option value="Debt" ${d.type === "Debt" ? "selected" : ""}>Debt</option>
        <option value="Clear Credit" ${d.type === "Clear Credit" ? "selected" : ""}>Clear Credit</option>
        <option value="Gift" ${d.type === "Gift" ? "selected" : ""}>Gift</option>
      </select>
    </td>
    <td><input type="text" class="row-voucher" value="${d.voucher}" disabled></td>
    <td><input type="text" class="row-to" value="${d.to}" ${disabled}></td>
    <td><input type="text" class="row-desc" value="${d.desc}" disabled></td>
    <td><input type="number" class="row-amount" value="${d.amount}" onwheel="this.blur()" ${disabled}></td>
  `;
  return tr;
}

// H a n d l e table interactions (input and change events)
function handleTableInteractions(e) {
  const tr = e.target.closest('tr');
  if (!tr) return;

  const date = document.getElementById('ledger-date').value;
  const type = tr.querySelector('.row-type').value;
  const qty = tr.querySelector('.row-qty').value
  const item = tr.querySelector('.row-item').value;
  const to = tr.querySelector('.row-to').value;
  const descInput = tr.querySelector('.row-desc');

  tr.querySelector('.row-voucher').value = VOUCHER_MAP[type] || "";

  if (type === "Gift") {
    descInput.value = `Beneficiary: ${to} received ${qty} ${item} on ${date}`;
  } else if (item && type) {
    descInput.value = `Being sale of ${qty} ${item} to ${to} via ${type} on ${date}`;
  }

  calculateTotal();
}

// C r e a t e s Initial 5 Rows For The Table
function seedInitialRows(count = 5) {
  const tbody = document.getElementById('ledgerBody');
  if (!tbody) return;
  tbody.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    tbody.appendChild(createTableRow(i, {}, false));
  }
}

// C a l c u l a t e the total amount in the table
function calculateTotal() {
  let amount = 0.00;

  document.querySelectorAll('#ledgerBody tr').forEach(tr => {
    amount += parseFloat(tr.querySelector('.row-amount').value) || 0;
  });

  const total = document.getElementById('total');

  if (total) {
    total.textContent = amount.toFixed(2);
  }
}

// Get Date, Month & Year in YYYY-MM-DD Format
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}



export default SalesTable;