import React, {useEffect} from 'react';
import { ArrowLeft } from 'lucide-react';
import '../styles/PurchaseTable.css';

const PAYMENT_TYPE_MAP = {
  "Cash": "CSH",
  "M-Pesa": "MPS",
  "Bank": "BNK",
  "Credit": "CRD",
  "Barter-Trade": "BTR"
};

const ITEM_CODE_MAP = {
  "Chicken(Grown)": "01",
  "Layers": "02",
  "Medicine": "03",
  "Eggs": "04",
  "Supplements": "05",
  "Chicks": "06",
  "Farm Feeds": "07",
  "Chick Mash": "08",
  "Kienyeji": "09"
};

function PurchasesTable({ selectedCategory, setSelectedCategory }) {

  useEffect(() => {
    initSalesLedger();
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
            <button className="ledger-btn">P00001</button>
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

// Ledger Date
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// L A U N C H  E N G I N E  F U N C T I O N S
function initSalesLedger() {
  const addBtn = document.getElementById('AddLineBtn');
  if (addBtn) {
    addBtn.removeEventListener('click', addSingleLine);
    addBtn.addEventListener('click', addSingleLine);
  }

  const body = document.getElementById('ledgerBody');
  if (body) {
    body.removeEventListener('input', handleTableInteractions);
    body.removeEventListener('change', handleTableInteractions);
    body.addEventListener('input', handleTableInteractions);
    body.addEventListener('change', handleTableInteractions);
  }

  seedInitialRows(5);
}

//===== T A B L E  F U N C T I O N S(ROWS) =====

// Creates Rows For The Table
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
    from: data.from || "",
    desc: data.desc || "",
    amount: data.amount || ""
  };

  const disabled = isLocked ? "disabled" : "";

  tr.innerHTML = `
    <td>${index}</td>
    <td>
      <select class="row-item" ${disabled}>
        <option value="" ${d.item === "" ? "selected" : ""}></option>
        <option value="Chicken(Grown)" ${d.item === "Chicken(Grown)" ? "selected" : ""}>Chicken(grown)</option>
        <option value="Layers" ${d.item === "Layers" ? "selected" : ""}>Layers</option>
        <option value="Medicine" ${d.item === "Medicine" ? "selected" : ""}>Medicine</option>
        <option value="Eggs" ${d.item === "Eggs" ? "selected" : ""}>Eggs</option>
        <option value="Supplements" ${d.item === "Supplements" ? "selected" : ""}>Supplements</option>
        <option value="Chicks" ${d.item === "Chicks" ? "selected" : ""}>Chicks</option>
        <option value="Chick Mash" ${d.item === "Chick Mash" ? "selected" : ""}>Chick Mash</option>
        <option value="Kienyeji" ${d.item === "Kienyeji" ? "selected" : ""}>Kienyeji</option>
        <option value="Starter Crams" ${d.item === "Starter Crams" ? "selected" : ""}>Starter Crams</option>
      </select>
    </td>
    <td><input type="number" class="row-qty" value="${d.qty}" onwheel="this.blur()" ${disabled}></td>
    <td>
      <select class="row-type" ${disabled}>
        <option value="" ${d.type === "" ? "selected" : ""}></option>
        <option value="Cash" ${d.type === "Cash" ? "selected" : ""}>Cash</option>
        <option value="M-Pesa" ${d.type === "M-Pesa" ? "selected" : ""}>M-Pesa</option>
        <option value="Bank" ${d.type === "Bank" ? "selected" : ""}>Bank</option>
        <option value="Credit" ${d.type === "Credit" ? "selected" : ""}>Credit</option>
        <option value="Barter-Trade" ${d.type === "Barter-Trade" ? "selected" : ""}>Barter-Trade</option>
      </select>
    </td>
    <td><input type="text" class="row-voucher" value="${d.voucher}" disabled></td>
    <td><input type="text" class="row-from" value="${d.from}" ${disabled}></td>
    <td><input type="text" class="row-desc" value="${d.desc}" disabled></td>
    <td><input type="number" class="row-amount" value="${d.amount}" onwheel="this.blur()" ${disabled}></td>
  `;
  return tr;
}

// Table Row V A L U E S Interactions
function handleTableInteractions(e) {
  const tr = e.target.closest('tr');
  if (!tr) return;

  const date = document.getElementById('ledger-date').value;
  const type = tr.querySelector('.row-type').value;
  const qty = tr.querySelector('.row-qty').value
  const item = tr.querySelector('.row-item').value;
  const from = tr.querySelector('.row-from').value;
  const voucherInput = tr.querySelector('.row-voucher');
  const descInput = tr.querySelector('.row-desc');

  if (e.target.classList.contains('row-item') || e.target.classList.contains('row-type')) {
    const itemCode = ITEM_CODE_MAP[item] || "00";
    const typeCode = PAYMENT_TYPE_MAP[type] || "XXX";
    voucherInput.value = item && type ? `P-${itemCode}-${typeCode}` : "";
  }

  if (type && item) {
    const origin = from ? `from ${from}` : "";
    descInput.value = `Being purchase of ${qty} ${item} by ${type} ${origin} on ${date}`
  } else {
    descInput.value = "";
    return;
  }

  calculations();
}

// Calculation Table Totals
function calculations() {
  let amount = 0.00;

  document.querySelectorAll('#ledgerBody tr').forEach(tr => {
    amount += parseFloat(tr.querySelector('.row-amount').value) || 0;
  });

  const total = document.getElementById('total');

  if (total) total.textContent = amount.toFixed(2);
}

// Creates Initial 5 Rows For The Table
function seedInitialRows(count = 5) {
  const tbody = document.getElementById('ledgerBody');
  if (!tbody) return;
  tbody.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    tbody.appendChild(createTableRow(i, {}, false));
  }
}

// Adds A Single Row To The Table
function addSingleLine() {
  const body = document.getElementById('ledgerBody');
  body.appendChild(createTableRow(body.children.length + 1, {}, false));
}

export default PurchasesTable;