import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../libs/supabase';
import '../styles/ExpenseTable.css';
import LedgerSearchModal from '../components/LedgerSearchModal';

function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
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
    desc: data.description || "",
    amount: data.amount ?? ""
  };

  const disabled = isLocked ? "disabled" : "";

  tr.innerHTML = `
    <td class="row-number">${index}</td>
    <td><input type="text" class="row-item" value="${escapeHtml(d.item)}" ${disabled}></td>
    <td><input type="text" class="row-type" value="${escapeHtml(d.desc)}" ${disabled}></td>
    <td><input type="number" class="row-amount" min="0" step="0.01" value="${escapeHtml(d.amount)}" onwheel="this.blur()" ${disabled}></td>
  `;

  return tr;
}

function renumberRows() {
  document.querySelectorAll('#ledgerBody tr').forEach((row, index) => {
    row.querySelector('.row-number').textContent = index + 1;
  });
}

function seedInitialRows(count = 4, entries = [], isLocked = false) {
  const tbody = document.getElementById('ledgerBody');
  if (!tbody) return;
  tbody.innerHTML = "";
  const rowCount = Math.max(count, entries.length);

  for (let i = 0; i < rowCount; i++) {
    const entry = entries[i];
    tbody.appendChild(createRows(i + 1, entry || {}, isLocked));
  }

  calculateTotals();
}

function handleTableInteractions() {
  calculateTotals();
}

function calculateTotals() {
  let amount = 0.00;

  document.querySelectorAll('#ledgerBody tr').forEach(tr => {
    amount += parseFloat(tr.querySelector('.row-amount')?.value) || 0;
  });

  const total = document.getElementById('total');
  if (total) total.textContent = amount.toFixed(2);

  return Number(amount.toFixed(2));
}

function getTableEntries() {
  return Array.from(document.querySelectorAll('#ledgerBody tr'))
    .map((tr, index) => ({
      line_no: index + 1,
      item: tr.querySelector('.row-item').value.trim() || null,
      description: tr.querySelector('.row-type').value.trim() || null,
      amount:
        tr.querySelector('.row-amount').value === ''
          ? 0
          : Number(tr.querySelector('.row-amount').value),
    }))
    .filter((entry) => entry.item || entry.description || entry.amount !== 0);
}

function getNextLedgerNumber(currentNumber) {
  const match = String(currentNumber || '').match(/^E(\d+)$/);
  const nextNumber = match ? Number(match[1]) + 1 : 1;
  return `E${String(nextNumber).padStart(5, '0')}`;
}

function ExpenseTable({ selectedCategory, setSelectedCategory }) {
  const [ledgerNo, setLedgerNo] = useState('E00001');
  const [ledgerId, setLedgerId] = useState(null);
  const [ledgerStatus, setLedgerStatus] = useState('draft');
  const [farmId, setFarmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const isLocked = ledgerStatus === 'committed' || ledgerStatus === 'cancelled';

  const loadLedger = useCallback(async (ledger) => {
    const { data: entries, error } = await supabase
      .from('expense_entries')
      .select('*')
      .eq('ledger_id', ledger.id)
      .order('line_no', { ascending: true });

    if (error) throw error;

    setLedgerId(ledger.id);
    setLedgerNo(ledger.ledger_no);
    setLedgerStatus(ledger.status);

    const dateInput = document.getElementById('ledger-date');
    if (dateInput) {
      dateInput.value = ledger.ledger_date;
      dateInput.disabled = ledger.status === 'committed' || ledger.status === 'cancelled';
    }

    seedInitialRows(4, entries || [], ledger.status !== 'draft');
  }, []);

  useEffect(() => {
    seedInitialRows(4);
    const tbody = document.getElementById('ledgerBody');

    tbody?.addEventListener('input', handleTableInteractions);
    tbody?.addEventListener('change', handleTableInteractions);

    let isMounted = true;

    async function loadLatestLedgerData() {
      try {
        const { data: membership, error: memberError } = await supabase
          .from('farm_members')
          .select('farm_id')
          .limit(1)
          .maybeSingle();

        if (memberError) throw memberError;
        if (!membership) {
          throw new Error('No farm membership found for the current user.');
        }

        if (!isMounted) return;
        const activeFarmId = membership.farm_id;
        setFarmId(activeFarmId);

        const { data: ledger, error } = await supabase
          .from('expense_ledgers')
          .select('*')
          .eq('farm_id', activeFarmId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (!isMounted) return;

        if (ledger) {
          await loadLedger(ledger);
        } else {
          setLedgerId(null);
          setLedgerNo('E00001');
          setLedgerStatus('draft');

          const dateInput = document.getElementById('ledger-date');
          if (dateInput) {
            dateInput.value = getTodayDate();
            dateInput.disabled = false;
          }

          seedInitialRows(4);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching expense ledger:', error);
          alert(`Could not fetch expense data: ${error.message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLatestLedgerData();

    return () => {
      isMounted = false;
      tbody?.removeEventListener('input', handleTableInteractions);
      tbody?.removeEventListener('change', handleTableInteractions);
    };
  }, [loadLedger]);

  async function saveLedger() {
    if (saving || isLocked) return;

    if (!farmId) {
      alert('Active farm ID is missing. Please reload the page.');
      return;
    }

    const ledgerDate = document.getElementById('ledger-date')?.value;
    if (!ledgerDate) {
      alert('Please select the ledger date.');
      return;
    }

    const entries = getTableEntries();
    if (entries.length === 0) {
      alert('Enter at least one expense entry before saving.');
      return;
    }

    for (const entry of entries) {
      if (entry.amount < 0 || !Number.isFinite(entry.amount)) {
        alert('Enter a valid, non-negative amount.');
        return;
      }
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      const { data: ledger, error: ledgerError } = await supabase
        .from('expense_ledgers')
        .upsert(
          {
            ...(ledgerId ? { id: ledgerId } : {}),
            farm_id: farmId,
            ledger_no: ledgerNo,
            ledger_date: ledgerDate,
            status: 'draft',
            total: calculateTotals(),
            updated_at: new Date().toISOString(),
            ...(userId && !ledgerId ? { created_by: userId } : {}),
          },
          { onConflict: 'farm_id, ledger_no' }
        )
        .select()
        .single();

      if (ledgerError) throw ledgerError;

      const { error: deleteError } = await supabase
        .from('expense_entries')
        .delete()
        .eq('ledger_id', ledger.id);

      if (deleteError) throw deleteError;

      const entriesToInsert = entries.map((entry) => ({
        ...entry,
        ledger_id: ledger.id,
        ...(userId ? { created_by: userId } : {}),
      }));

      const { error: entriesError } = await supabase
        .from('expense_entries')
        .insert(entriesToInsert);

      if (entriesError) throw entriesError;

      setLedgerId(ledger.id);
      setLedgerStatus('draft');

      alert(`Ledger ${ledgerNo} saved successfully.`);
    } catch (error) {
      console.error('Error saving expense ledger:', error);
      alert(`Could not save expense data: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  function addSingleLine() {
    if (isLocked) return;
    const tbody = document.getElementById('ledgerBody');
    if (!tbody) return;
    tbody.appendChild(createRows(tbody.children.length + 1, {}, false));
  }

  function deleteLine() {
    if (isLocked) return;
    const tbody = document.getElementById('ledgerBody');
    if (!tbody) return;

    const selectedRow = tbody.querySelector('.selected-row');
    const rowToDelete = selectedRow || tbody.lastElementChild;

    if (!rowToDelete) return;

    rowToDelete.remove();
    renumberRows();
    calculateTotals();
  }

  function newLedger() {
    if (saving) return;

    if (
      ledgerId &&
      ledgerStatus === 'draft' &&
      !window.confirm('Start a new ledger? Save your current changes first.')
    ) {
      return;
    }

    setLedgerId(null);
    setLedgerNo(getNextLedgerNumber(ledgerNo));
    setLedgerStatus('draft');

    const dateInput = document.getElementById('ledger-date');
    if (dateInput) {
      dateInput.value = getTodayDate();
      dateInput.disabled = false;
    }

    seedInitialRows(4);
  }

  async function commitLedger() {
    if (!ledgerId || ledgerStatus !== 'draft') {
      alert('Save the ledger before committing it.');
      return;
    }

    if (!window.confirm('Commit this ledger? It will become read-only.')) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('expense_ledgers')
        .update({
          status: 'committed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ledgerId)
        .eq('status', 'draft');

      if (error) throw error;

      setLedgerStatus('committed');
      await loadLedger({
        id: ledgerId,
        ledger_no: ledgerNo,
        ledger_date: document.getElementById('ledger-date').value,
        status: 'committed',
      });

      alert(`Ledger ${ledgerNo} committed.`);
    } catch (error) {
      console.error('Error committing ledger:', error);
      alert(`Could not commit ledger: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

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
        <h1>{(selectedCategory || 'expenses').toUpperCase()} Ledger Table</h1>
      </div>

      <div className="table-placeholder-card">
        <div className="expense-header">
          <div className="header-left">
            <div className="ledger">
              <label>Ledger No</label>
              <button 
                className="ledger-btn" 
                type="button" 
                onClick={() => setIsSearchModalOpen(true)}
                title="Click to search/load ledgers"
              >
                {ledgerNo} 🔍
              </button>
            </div>
          </div>

          <div className="header-right">
            <label htmlFor="ledger-date">Date</label>
            <input type="date" id="ledger-date" defaultValue={getTodayDate()} disabled={isLocked}></input>
          </div>
        </div>

        {loading && <p>Loading expense data...</p>}

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
          <button 
            id="addLine" 
            className="btn-sec" 
            onClick={addSingleLine}
            disabled={isLocked || saving || loading}
          >
            + Add line
          </button>
          <button 
            id="newLedger" 
            className="btn-pri" 
            onClick={newLedger}
            disabled={saving || loading}
          >
            New ledger
          </button>
          <button 
            id="saveBtn" 
            className="btn-pri" 
            onClick={saveLedger}
            disabled={isLocked || saving || loading}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button 
            id="commitBtn" 
            className="btn-success" 
            onClick={commitLedger}
            disabled={isLocked || saving || loading}
          >
            Commit
          </button>
          <button 
            id="deleteLineBtn" 
            className="btn-danger" 
            onClick={deleteLine}
            disabled={isLocked || saving || loading}
          >
            Delete Line
          </button>
        </div>
      </div>
      <LedgerSearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        ledgerTableName="expense_ledgers"
        farmId={farmId}
        onSelectLedger={(selectedLedger) => {
          loadLedger(selectedLedger);
        }}
      />
    </div>
  );
}

export default ExpenseTable;