import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from "lucide-react";
import { supabase } from "../libs/supabase";
import '../styles/CreditorTable.css';

function CreditorTable({ selectedCategory, setSelectedCategory, farmId: propFarmId }) {
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

      // Find the farm linked to this user via farm_members
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

  // Reusable data fetching function wrapped in useCallback
  const fetchCreditorData = useCallback(async () => {
    try {
      const activeFarmId = await getFarmIdForUser();
      setResolvedFarmId(activeFarmId);

      // 1. Fetch purchases bought on credit
      let purchaseQuery = supabase
        .from('purchase_entries')
        .select(`
          id,
          item,
          quantity,
          payment_type,
          voucher_no,
          description,
          amount,
          created_at,
          ledger:ledger_id ( farm_id, ledger_no )
        `)
        .ilike('payment_type', '%credit%');

      if (activeFarmId) {
        purchaseQuery = purchaseQuery.eq('ledger.farm_id', activeFarmId);
      }

      const { data: purchaseData, error: purchaseError } = await purchaseQuery;
      if (purchaseError) throw purchaseError;

      // 2. Fetch manual settlements from creditor_settlements
      let settleQuery = supabase.from('creditor_settlements').select('*');
      if (activeFarmId) {
        settleQuery = settleQuery.eq('farm_id', activeFarmId);
      }
      const { data: settlementData, error: settleError } = await settleQuery;
      if (settleError) throw settleError;

      // 3. Fetch sales used to settle credit from sales_entries
      let salesQuery = supabase
        .from('sales_entries')
        .select(`
          id,
          item,
          quantity,
          payment_type,
          voucher_no,
          description,
          amount,
          created_at,
          ledger:ledger_id ( farm_id, ledger_no )
        `)
        .or('payment_type.ilike.%credit%,payment_type.ilike.%settlement%,payment_type.ilike.%offset%');

      if (activeFarmId) {
        salesQuery = salesQuery.eq('ledger.farm_id', activeFarmId);
      }

      const { data: salesData, error: salesError } = await salesQuery;
      if (salesError) {
        console.warn("Could not fetch sales settlement entries:", salesError);
      }

      // Format rows combining credit purchases and settlements
      let combinedRows = [];

      // Map credit purchases as Credit (Owed) entries
      (purchaseData || []).forEach((p) => {
        combinedRows.push({
          id: p.id,
          source: 'purchase',
          item: p.item || 'Credit Purchase',
          qty: p.quantity || 1,
          creditor: p.description || p.voucher_no || 'Supplier',
          type: 'Credit',
          voucher: p.voucher_no || '',
          desc: p.description || '',
          dr: 0, 
          cr: Number(p.amount) || 0,
        });
      });

      // Map manual settlements as Debit entries reducing credit
      (settlementData || []).forEach((s) => {
        combinedRows.push({
          id: s.id,
          source: 'settlement',
          item: 'Settlement Payment',
          qty: 1,
          creditor: s.creditor_name,
          type: s.settlement_type,
          voucher: s.voucher_no || '',
          desc: s.description || 'Account Settlement',
          dr: Number(s.amount_settled) || 0,
          cr: 0,
        });
      });

      // Map sales-based settlements as Debit entries reducing credit
      (salesData || []).forEach((sl) => {
        combinedRows.push({
          id: sl.id,
          source: 'sale_settlement',
          item: sl.item || 'Sales Settlement',
          qty: sl.quantity || 1,
          creditor: sl.description || sl.voucher_no || 'Customer/Creditor',
          type: sl.payment_type || 'Sales Offset',
          voucher: sl.voucher_no || '',
          desc: sl.description || 'Settled via Sales',
          dr: Number(sl.amount) || 0,
          cr: 0,
        });
      });

      if (combinedRows.length === 0) {
        combinedRows = Array.from({ length: 5 }, (_, i) => ({
          id: `empty-${i}`,
          source: 'manual',
          item: '',
          qty: '',
          creditor: '',
          type: '',
          voucher: '',
          desc: '',
          dr: '',
          cr: ''
        }));
      }

      return combinedRows;
    } catch (err) {
      console.error("Error fetching creditor ledger data:", err);
      return [];
    }
  }, [getFarmIdForUser]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const data = await fetchCreditorData();
      if (isMounted) {
        setRows(data);
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchCreditorData]);

  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  // Execute manual settlement with automatically resolved farm_id & voucher_no
  const handleSaveSettlement = async () => {
    if (selectedRowIndex === null || !rows[selectedRowIndex]) {
      alert("Please select a creditor row to settle.");
      return;
    }

    const targetRow = rows[selectedRowIndex];
    const creditorName = targetRow.creditor;

    if (!creditorName || creditorName === 'Supplier' || creditorName === 'Customer/Creditor') {
      alert("Selected row does not have a valid creditor/supplier name.");
      return;
    }

    const amount = parseFloat(settleAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid settlement amount.");
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
        creditor_name: creditorName,
        settlement_date: new Date().toISOString().split('T')[0],
        amount_settled: amount,
        settlement_type: settleType,
        voucher_no: settleVoucher.trim() || null,
        description: settleDesc.trim() || 'Manual settlement payment'
      };

      const { error } = await supabase.from('creditor_settlements').insert(payload);
      if (error) throw error;

      alert(`Successfully settled KES ${amount} for ${creditorName}`);
      setIsSettleModalOpen(false);
      setSettleAmount("");
      setSettleVoucher("");
      setSettleDesc("");
      setSelectedRowIndex(null);
      
      // Refresh table data
      setLoading(true);
      const updatedData = await fetchCreditorData();
      setRows(updatedData);
      setLoading(false);
    } catch (err) {
      console.error("Settlement error:", err);
      alert(err.message || "Failed to process settlement.");
    }
  };

  // Calculate Totals
  const totalDr = rows.reduce((acc, r) => acc + (Number(r.dr) || 0), 0);
  const totalCr = rows.reduce((acc, r) => acc + (Number(r.cr) || 0), 0);
  const netBalance = totalCr - totalDr;

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
        <h1>{(selectedCategory || 'creditors').toUpperCase()} Ledger Table</h1>
      </div>

      <div className="table-placeholder-card">
        <div className="creditor-header">
          <div className="header-left">
            <label>Creditors Account</label>
          </div>

          <div className="header-right">
            <label>Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading credit & settlement records...</p>
          ) : (
            <table className="creditor-table">
              <thead>
                <tr>
                  <th style={{ width: "4%" }}>#</th>
                  <th style={{ width: "15%" }}>Item / Details</th>
                  <th style={{ width: "7%" }}>Qty</th>
                  <th style={{ width: "15%" }}>Creditor / Supplier</th>
                  <th style={{ width: "13%" }}>Settlement Type</th>
                  <th style={{ width: "10%" }}>Voucher No.</th>
                  <th style={{ width: "18%" }}>Description</th>
                  <th style={{ width: "9%" }}>Debit (Paid)</th>
                  <th style={{ width: "9%" }}>Credit (Owed)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr 
                    key={r.id || idx}
                    className={`${selectedRowIndex === idx ? 'selected-row' : ''} ${r.source === 'purchase' ? 'cred-purchase-row' : ''}`}
                    onClick={() => handleRowClick(idx)}
                  >
                    <td>{idx + 1}</td>
                    <td><input type="text" value={r.item} readOnly /></td>
                    <td><input type="number" className="row-qty" value={r.qty} readOnly /></td>
                    <td><input type="text" value={r.creditor} readOnly /></td>
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
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold' }}>Net Creditors Position (Owed - Paid):</td>
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
                alert("Please select a creditor row to settle.");
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
            <h3>Settle Creditor Account</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1rem' }}>
              Creditor: <b>{rows[selectedRowIndex]?.creditor}</b>
            </p>

            <label>Settlement Amount (KES)</label>
            <input 
              type="number" 
              placeholder="Enter amount to pay" 
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
              <option value="Sales Offset">Sales Offset (Paid via Sales)</option>
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
              placeholder="Partial or full payment note" 
              value={settleDesc} 
              onChange={(e) => setSettleDesc(e.target.value)}
            />

            <div className="settle-modal-actions">
              <button className="btn-sec" onClick={() => setIsSettleModalOpen(false)}>Cancel</button>
              <button className="btn-success" onClick={handleSaveSettlement}>Confirm Settlement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditorTable;