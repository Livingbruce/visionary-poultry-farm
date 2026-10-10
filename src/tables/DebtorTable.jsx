import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../libs/supabase';
import '../styles/DebtorTable.css';

function DebtorTable({ setSelectedCategory, selectedCategory, farmId: propFarmId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [resolvedFarmId, setResolvedFarmId] = useState(propFarmId);

  // Settlement Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleType, setSettleType] = useState("Cash");
  const [settleVoucher, setSettleVoucher] = useState("");
  const [settleDesc, setSettleDesc] = useState("");

  // Helper to resolve farm_id using auth.uid() if propFarmId is not provided
  const getFarmIdForUser = useCallback(async () => {
    if (propFarmId) return propFarmId;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;

      const { data: memberData, error: memberError } = await supabase
        .from('farm_members')
        .select('farm_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (memberError || !memberData) return null;
      return memberData.farm_id;
    } catch (err) {
      console.error("Error resolving farm ID:", err);
      return null;
    }
  }, [propFarmId]);

  // Fetch Debt Sales and Debt Settlements
  const fetchDebtorData = useCallback(async () => {
    try {
      const activeFarmId = await getFarmIdForUser();
      setResolvedFarmId(activeFarmId);

      // 1. Fetch sales sold on debt/credit (matching 'Debt' or 'Credit' payment types)
      let salesQuery = supabase
        .from('sales_entries')
        .select(`
          id,
          item,
          quantity,
          payment_type,
          voucher_no,
          customer,
          description,
          amount,
          created_at,
          ledger:ledger_id ( farm_id, ledger_no )
        `)
        .or('payment_type.ilike.%credit%,payment_type.ilike.%debt%');

      if (activeFarmId) {
        salesQuery = salesQuery.eq('ledger.farm_id', activeFarmId);
      }

      const { data: salesData, error: salesError } = await salesQuery;
      if (salesError) throw salesError;

      // 2. Fetch existing debt settlements
      let settleQuery = supabase.from('debtor_settlements').select('*');
      if (activeFarmId) {
        settleQuery = settleQuery.eq('farm_id', activeFarmId);
      }
      const { data: settlementData, error: settleError } = await settleQuery;
      if (settleError) throw settleError;

      let combinedRows = [];

      // Map credit/debt sales as Debit (Owed) entries
      (salesData || []).forEach((s) => {
        combinedRows.push({
          id: s.id,
          source: 'sale',
          item: s.item || 'Credit Sale',
          qty: s.quantity || 1,
          debtor: s.customer || s.description || 'Customer',
          type: s.payment_type || 'Debt',
          voucher: s.voucher_no || '',
          desc: s.description || '',
          dr: Number(s.amount) || 0, // Amount owed
          cr: 0,
        });
      });

      // Map debt settlements as Credit (Paid) entries reducing debt
      (settlementData || []).forEach((ds) => {
        combinedRows.push({
          id: ds.id,
          source: 'settlement',
          item: 'Debt Settlement Payment',
          qty: 1,
          debtor: ds.debtor_name,
          type: ds.settlement_type,
          voucher: ds.voucher_no || '',
          desc: ds.description || 'Debt Payment',
          dr: 0,
          cr: Number(ds.amount_paid) || 0, // Amount paid
        });
      });

      if (combinedRows.length === 0) {
        combinedRows = Array.from({ length: 5 }, (_, i) => ({
          id: `empty-${i}`,
          source: 'manual',
          item: '',
          qty: '',
          debtor: '',
          type: '',
          voucher: '',
          desc: '',
          dr: '',
          cr: ''
        }));
      }

      return combinedRows;
    } catch (err) {
      console.error("Error fetching debtor ledger data:", err);
      return [];
    }
  }, [getFarmIdForUser]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const data = await fetchDebtorData();
      if (isMounted) {
        setRows(data);
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchDebtorData]);

  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  // Execute manual settlement for debtor account
  const handleSaveSettlement = async () => {
    if (selectedRowIndex === null || !rows[selectedRowIndex]) {
      alert("Please select a debtor row to settle.");
      return;
    }

    const targetRow = rows[selectedRowIndex];
    const debtorName = targetRow.debtor;

    if (!debtorName || debtorName === 'Customer') {
      alert("Selected row does not have a valid debtor/customer name.");
      return;
    }

    const amount = parseFloat(settleAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid payment settlement amount.");
      return;
    }

    const activeFarmId = resolvedFarmId || await getFarmIdForUser();
    if (!activeFarmId) {
      alert("Could not determine farm ID for the current user.");
      return;
    }

    try {
      const payload = {
        farm_id: activeFarmId,
        debtor_name: debtorName,
        settlement_date: new Date().toISOString().split('T')[0],
        amount_paid: amount,
        settlement_type: settleType,
        voucher_no: settleVoucher.trim() || null,
        description: settleDesc.trim() || 'Debt settlement payment'
      };

      const { error } = await supabase.from('debtor_settlements').insert(payload);
      if (error) throw error;

      alert(`Successfully recorded KES ${amount} payment from ${debtorName}`);
      setIsSettleModalOpen(false);
      setSettleAmount("");
      setSettleVoucher("");
      setSettleDesc("");
      setSelectedRowIndex(null);

      // Refresh table data
      setLoading(true);
      const updatedData = await fetchDebtorData();
      setRows(updatedData);
      setLoading(false);
    } catch (err) {
      console.error("Settlement error:", err);
      alert(err.message || "Failed to process debt settlement.");
    }
  };

  // Calculate Totals
  const totalDr = rows.reduce((acc, r) => acc + (Number(r.dr) || 0), 0);
  const totalCr = rows.reduce((acc, r) => acc + (Number(r.cr) || 0), 0);
  const netBalance = totalDr - totalCr; // Net Accounts Receivable

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
            <label>Debtors Account</label>
          </div>

          <div className="header-right">
            <label>Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading credit sales & debt collection records...</p>
          ) : (
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
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id || idx}
                    className={`${selectedRowIndex === idx ? 'selected-row' : ''} ${r.source === 'sale' ? 'debt-sales-row' : ''}`}
                    onClick={() => handleRowClick(idx)}
                  >
                    <td>{idx + 1}</td>
                    <td><input type="text" value={r.item} readOnly /></td>
                    <td><input type="number" className="row-qty" value={r.qty} readOnly /></td>
                    <td><input type="text" value={r.debtor} readOnly /></td>
                    <td><input type="text" value={r.type} readOnly /></td>
                    <td><input type="text" value={r.voucher} readOnly /></td>
                    <td><input type="text" value={r.desc} readOnly /></td>
                    <td><input type="number" className="row-dr" value={r.dr || ''} readOnly /></td>
                    <td><input type="number" className="row-cr" value={r.cr || ''} readOnly /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold' }}>Net Accounts Receivable (Owed - Paid):</td>
                  <td style={{ fontWeight: 'bold' }}>{totalDr.toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold' }}>{totalCr.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={9} style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f8fafc', padding: '8px' }}>
                    Outstanding Balance: KES {netBalance.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="footer-actions">
          <button
            className="btn-pri"
            onClick={() => {
              if (selectedRowIndex === null) {
                alert("Please select a debtor row to settle.");
                return;
              }
              setIsSettleModalOpen(true);
            }}
          >
            Settle Selected Account
          </button>
        </div>
      </div>

      {/* Manual Settlement Modal */}
      {isSettleModalOpen && (
        <div className="settle-modal-overlay">
          <div className="settle-modal-card">
            <h3>Settle Debtor Account</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1rem' }}>
              Debtor: <b>{rows[selectedRowIndex]?.debtor}</b>
            </p>

            <label>Payment Amount Received (KES)</label>
            <input
              type="number"
              placeholder="Enter amount paid"
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
            />

            <label>Payment Method</label>
            <select
              value={settleType}
              onChange={(e) => setSettleType(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Bank">Bank</option>
              <option value="Eggs">Eggs (In-Kind)</option>
              <option value="Chicken">Chicken (In-Kind)</option>
            </select>

            <label>Voucher / Receipt No.</label>
            <input
              type="text"
              placeholder="Optional receipt number"
              value={settleVoucher}
              onChange={(e) => setSettleVoucher(e.target.value)}
            />

            <label>Description / Notes</label>
            <input
              type="text"
              placeholder="Partial or full debt payment note"
              value={settleDesc}
              onChange={(e) => setSettleDesc(e.target.value)}
            />

            <div className="settle-modal-actions">
              <button className="btn-sec" onClick={() => setIsSettleModalOpen(false)}>Cancel</button>
              <button className="btn-success" onClick={handleSaveSettlement}>Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebtorTable;