import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../libs/supabase';
import '../styles/SalesTable.css';
import LedgerSearchModal from '../components/LedgerSearchModal';

const VOUCHER_MAP = {
  Cash: '01',
  'M-pesa': '02',
  Debt: '03',
  Bank: '04',
  'Clear Credit': '05',
  Gift: '06',
};

const ITEMS = ['Chicken', 'Chick', 'Manure', 'Eggs'];
const TYPES = ['M-pesa', 'Cash', 'Bank', 'Debt', 'Clear Credit', 'Gift'];

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

function createTableRow(index, data = {}, isLocked = false) {
  const item = data.item ?? '';
  const qty = data.qty ?? '';
  const type = data.type ?? '';
  const voucher = data.voucher ?? '';
  const customer = data.customer ?? '';
  const description = data.description ?? '';
  const amount = data.amount ?? '';

  const disabled = isLocked ? 'disabled' : '';

  const itemOptions = ITEMS.map(
    (option) =>
      `<option value="${option}" ${
        item === option ? 'selected' : ''
      }>${option}</option>`
  ).join('');

  const typeOptions = TYPES.map(
    (option) =>
      `<option value="${escapeHtml(option)}" ${
        type === option ? 'selected' : ''
      }>${escapeHtml(option)}</option>`
  ).join('');

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="row-number">${index}</td>
    <td>
      <select class="row-item" ${disabled}>
        <option value=""></option>
        ${itemOptions}
      </select>
    </td>
    <td>
      <input type="number" class="row-qty" min="0" step="any" value="${escapeHtml(qty)}" ${disabled}>
    </td>
    <td>
      <select class="row-type" ${disabled}>
        <option value=""></option>
        ${typeOptions}
      </select>
    </td>
    <td>
      <input type="text" class="row-voucher" value="${escapeHtml(voucher)}" disabled>
    </td>
    <td>
      <input type="text" class="row-to" value="${escapeHtml(customer)}" ${disabled}>
    </td>
    <td>
      <input type="text" class="row-desc" value="${escapeHtml(description)}" disabled>
    </td>
    <td>
      <input type="number" class="row-amount" min="0" step="0.01" value="${escapeHtml(amount)}" ${disabled}>
    </td>
  `;

  tr.addEventListener('click', () => {
    if (isLocked) return;
    document.querySelectorAll('#ledgerBody tr').forEach((row) => row.classList.remove('selected-row'));
    tr.classList.add('selected-row');
  });

  return tr;
}

function renumberRows() {
  document.querySelectorAll('#ledgerBody tr').forEach((row, index) => {
    row.querySelector('.row-number').textContent = index + 1;
  });
}

function seedInitialRows(count = 5, entries = [], isLocked = false) {
  const tbody = document.getElementById('ledgerBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const rowCount = Math.max(count, entries.length);

  for (let index = 0; index < rowCount; index++) {
    const entry = entries[index];
    tbody.appendChild(
      createTableRow(
        index + 1,
        entry
          ? {
              item: entry.item,
              qty: entry.quantity,
              type: entry.payment_type,
              voucher: entry.voucher_no,
              customer: entry.customer,
              description: entry.description,
              amount: entry.amount,
            }
          : {},
        isLocked
      )
    );
  }

  calculateTotal();
}

function handleTableInteractions(event) {
  const tr = event.target.closest('tr');
  if (!tr) return;

  const date = document.getElementById('ledger-date')?.value;
  const type = tr.querySelector('.row-type').value;
  const qty = tr.querySelector('.row-qty').value;
  const item = tr.querySelector('.row-item').value;
  const customer = tr.querySelector('.row-to').value;
  const description = tr.querySelector('.row-desc');

  tr.querySelector('.row-voucher').value = VOUCHER_MAP[type] || '';

  if (type === 'Gift') {
    description.value = `Beneficiary: ${customer} received ${qty} ${item} on ${date}`;
  } else if (item && type) {
    description.value = `Being sale of ${qty} ${item} to ${customer} via ${type} on ${date}`;
  } else {
    description.value = '';
  }

  calculateTotal();
}

function calculateTotal() {
  let total = 0;
  document.querySelectorAll('#ledgerBody tr').forEach((tr) => {
    total += Number(tr.querySelector('.row-amount')?.value) || 0;
  });

  const totalElement = document.getElementById('total');
  if (totalElement) {
    totalElement.textContent = total.toFixed(2);
  }

  return Number(total.toFixed(2));
}

function getTableEntries() {
  return Array.from(document.querySelectorAll('#ledgerBody tr'))
    .map((tr, index) => ({
      line_no: index + 1,
      item: tr.querySelector('.row-item').value || null,
      quantity:
        tr.querySelector('.row-qty').value === ''
          ? null
          : Number(tr.querySelector('.row-qty').value),
      payment_type: tr.querySelector('.row-type').value || null,
      voucher_no: tr.querySelector('.row-voucher').value || null,
      customer: tr.querySelector('.row-to').value.trim() || null,
      description: tr.querySelector('.row-desc').value.trim() || null,
      amount:
        tr.querySelector('.row-amount').value === ''
          ? 0
          : Number(tr.querySelector('.row-amount').value),
    }))
    .filter((entry) =>
      entry.item ||
      entry.quantity !== null ||
      entry.payment_type ||
      entry.customer ||
      entry.description ||
      entry.amount !== 0
    );
}

function getNextLedgerNumber(currentNumber) {
  const match = String(currentNumber || '').match(/^S(\d+)$/);
  const nextNumber = match ? Number(match[1]) + 1 : 1;
  return `S${String(nextNumber).padStart(5, '0')}`;
}

function SalesTable({ setSelectedCategory, selectedCategory }) {
  const [ledgerNo, setLedgerNo] = useState('S00001');
  const [ledgerId, setLedgerId] = useState(null);
  const [ledgerStatus, setLedgerStatus] = useState('draft');
  const [farmId, setFarmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const isLocked = ledgerStatus === 'committed' || ledgerStatus === 'cancelled';

  const loadLedger = useCallback(async (ledger) => {
    const { data: entries, error } = await supabase
      .from('sales_entries')
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

    seedInitialRows(5, entries || [], ledger.status !== 'draft');
  }, []);

  useEffect(() => {
    seedInitialRows(5);
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
          .from('sales_ledgers')
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
          setLedgerNo('S00001');
          setLedgerStatus('draft');

          const dateInput = document.getElementById('ledger-date');
          if (dateInput) {
            dateInput.value = getTodayDate();
            dateInput.disabled = false;
          }

          seedInitialRows(5);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching sales ledger:', error);
          alert(`Could not fetch sales data: ${error.message}`);
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
      alert('Enter at least one sales entry before saving.');
      return;
    }

    for (const entry of entries) {
      if (entry.quantity !== null && entry.quantity < 0) {
        alert('Quantity cannot be negative.');
        return;
      }
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
        .from('sales_ledgers')
        .upsert(
          {
            ...(ledgerId ? { id: ledgerId } : {}),
            farm_id: farmId,
            ledger_no: ledgerNo,
            ledger_date: ledgerDate,
            status: 'draft',
            total: calculateTotal(),
            updated_at: new Date().toISOString(),
            ...(userId && !ledgerId ? { created_by: userId } : {}),
          },
          { onConflict: 'ledger_no' }
        )
        .select()
        .single();

      if (ledgerError) throw ledgerError;

      const { error: deleteError } = await supabase
        .from('sales_entries')
        .delete()
        .eq('ledger_id', ledger.id);

      if (deleteError) throw deleteError;

      const entriesToInsert = entries.map((entry) => ({
        ...entry,
        ledger_id: ledger.id,
        ...(userId ? { created_by: userId } : {}),
      }));

      const { error: entriesError } = await supabase
        .from('sales_entries')
        .insert(entriesToInsert);

      if (entriesError) throw entriesError;

      setLedgerId(ledger.id);
      setLedgerStatus('draft');

      alert(`Ledger ${ledgerNo} saved successfully.`);
    } catch (error) {
      console.error('Error saving sales ledger:', error);
      alert(`Could not save sales data: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  function addLine() {
    if (isLocked) return;
    const tbody = document.getElementById('ledgerBody');
    if (!tbody) return;
    tbody.appendChild(createTableRow(tbody.children.length + 1));
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
    calculateTotal();
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

    seedInitialRows(5);
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
        .from('sales_ledgers')
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

  async function cancelLedger() {
    if (saving) return;

    if (!window.confirm('Cancel this ledger? A saved draft will be marked as cancelled.')) {
      return;
    }

    setSaving(true);

    try {
      if (ledgerId && ledgerStatus === 'draft') {
        const { error } = await supabase
          .from('sales_ledgers')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', ledgerId)
          .eq('status', 'draft');

        if (error) throw error;
      }

      setLedgerId(null);
      setLedgerNo(getNextLedgerNumber(ledgerNo));
      setLedgerStatus('draft');

      const dateInput = document.getElementById('ledger-date');
      if (dateInput) {
        dateInput.value = getTodayDate();
        dateInput.disabled = false;
      }

      seedInitialRows(5);
    } catch (error) {
      console.error('Error cancelling ledger:', error);
      alert(`Could not cancel ledger: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page transactions-container">
      <div className="table-view-header">
        <button className="back-btn" onClick={() => setSelectedCategory(null)}>
          <ArrowLeft size={18} />
          <span>Back to Transactions</span>
        </button>

        <h1>{(selectedCategory || 'sales').toUpperCase()} Ledger Table</h1>
      </div>

      <div className="table-placeholder-card">
        <div className="sales-header">
          <div className="header-left">
            <label>Ledger No:</label>
            <button 
              className="ledger-btn" 
              type="button" 
              onClick={() => setIsSearchModalOpen(true)}
              title="Click to search/load ledgers"
            >
              {ledgerNo} 🔍
            </button>
          </div>

          <div className="header-right">
            <label htmlFor="ledger-date">Date</label>
            <input
              type="date"
              id="ledger-date"
              defaultValue={getTodayDate()}
              disabled={isLocked}
            />
          </div>
        </div>

        {loading && <p>Loading sales data...</p>}

        <div className="table-wrapper">
          <table className="sales-table" id="sales-table">
            <thead>
              <tr>
                <th style={{ width: '4%' }}>#</th>
                <th style={{ width: '14%' }}>Item</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '12%' }}>Type</th>
                <th style={{ width: '10%' }}>Voucher No</th>
                <th style={{ width: '14%' }}>Customer</th>
                <th style={{ width: '20%' }}>Description</th>
                <th style={{ width: '16%' }}>Amount</th>
              </tr>
            </thead>

            <tbody id="ledgerBody"></tbody>

            <tfoot>
              <tr className="totals-row">
                <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  Total Balance:
                </td>
                <td id="total" style={{ fontWeight: 'bold' }}>
                  0.00
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="footer-actions">
          <button
            id="deleteLineBtn"
            className="btn-sec"
            onClick={deleteLine}
            disabled={isLocked || saving || loading}
          >
            DeleteLine
          </button>

          <button
            id="AddLineBtn"
            className="btn-sec"
            onClick={addLine}
            disabled={isLocked || saving || loading}
          >
            + Add Line
          </button>

          <button
            id="newLedgerBtn"
            className="btn-pri"
            onClick={newLedger}
            disabled={saving || loading}
          >
            New Ledger
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
            id="cancelBtn"
            className="btn-danger"
            onClick={cancelLedger}
            disabled={saving || loading || ledgerStatus === 'cancelled'}
          >
            Cancel
          </button>
        </div>
      </div>
      <LedgerSearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        ledgerTableName="sales_ledgers"
        farmId={farmId}
        onSelectLedger={(selectedLedger) => {
          loadLedger(selectedLedger);
        }}
      />
    </div>
  );
}

export default SalesTable;