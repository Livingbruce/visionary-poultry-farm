import react, {useEffect} from 'react';
import { ArrowLeft } from 'lucide-react';
import '../styles/ExpenseTable.css';

function ExpenseTable({ selectedCategory, setSelectedCategory }) {

  useEffect(() => {
    initializeTable();
  });

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
        <div className="expense-header">
          <div className="header-left">
            <div className="ledger">
              <label>Ledger No</label>
              <button className="ledger-btn">E00001</button>
            </div>
          </div>

          <div className="header-right">
            <label>Date</label>
            <input type="date" id="ledger-date" defaultValue={getTodayDate()}></input>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="expense-table" id="expense-table">
            <thead>
              <tr>
                <th style={{width: "6%"}}>#</th>
                <th style={{width: "30%"}}>Expense</th>
                <th style={{width: "40%"}}>Description</th>
                <th style={{width: "24%"}}>Amount</th>
              </tr>
            </thead>
            <tbody id="ledgerBody"></tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Expense:</td>
                <td id="total" style={{ fontWeight: 'bold' }}>0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="footer-actions">
          <button id="addLine" className="btn-sec">+ Add line</button>
          <button id="newLedger" className="btn-pri">New ledger</button>
          <button id="saveBtn" className="btn-pri">Save</button>
          <button id="commitBtn" className="btn-success">Commit</button>
          <button id="deleteLineBtn" className="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function initializeTable() {
  const addBtn = document.getElementById('addLine');
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

  seedInitialRows(4);
}

function createRows(index, data = {}, isLocked = false) {
  const tr = document.createElement('tr');
  tr.addEventListener('click', () => {
    if (!isLocked) {
      document.querySelectorAll('#ledgerBody tr').forEach(r => 
        r.classList.remove('selected-row'));
        tr.classList.add('selected-row');
    }
  });

  const d = {
    item: data.item || "",
    desc: data.desc || "",
    amount: data.amount || ""
  };

  const disabled = isLocked ? "disabled" : "";

  tr.innerHTML = `
    <td>${index}</td>
    <td><input type="text" class="row-item" value="${d.item}" ${disabled}></td>
    </td>
    <td><input type="text" class="row-type" value="${d.desc}" ${disabled}></td>
    <td><input type="number" class="row-amount" value="${d.amount}" ${disabled}></td>
  `;

  return tr;
}

function seedInitialRows(count = 4) {
  const tbody = document.getElementById('ledgerBody');
  if (!tbody) return;
  tbody.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    tbody.appendChild(createRows(i, {}, false));
  }
}

function handleTableInteractions(e) {
  const tr = e.target.closest('tr');
  if (!tr) return;

  calculateTotals();
}

function calculateTotals() {
  let amount = 0.00;

  document.querySelectorAll('#ledgerBody tr').forEach(tr => {
    amount += parseFloat(tr.querySelector('.row-amount').value) || 0;
  })

  const total = document.getElementById('total');

  if (total) total.textContent = amount.toFixed(2);
}

function addSingleLine() {
  const body = document.getElementById('ledgerBody');
  body.appendChild(createRows(body.children.length + 1, {}, false));
}

export default ExpenseTable;