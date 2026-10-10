import { useEffect, useState } from 'react';
import { supabase } from '../libs/supabase';

function LedgerSearchModal({ isOpen, onClose, onSelectLedger, ledgerTableName, farmId }) {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !farmId || !ledgerTableName) return;

    async function fetchLedgers() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(ledgerTableName)
          .select('*')
          .eq('farm_id', farmId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLedgers(data || []);
      } catch (err) {
        console.error("Error fetching ledgers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLedgers();
  }, [isOpen, ledgerTableName, farmId]);

  if (!isOpen) return null;

  return (
    <div className="settle-modal-overlay">
      <div className="settle-modal-card" style={{ width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3>Select Ledger ({ledgerTableName.replace('_', ' ').toUpperCase()})</h3>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '1.5rem' }}>Loading saved ledgers...</p>
        ) : ledgers.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>No saved ledgers found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '8px' }}>Ledger No</th>
                <th style={{ padding: '8px' }}>Date</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((l) => (
                <tr 
                  key={l.id} 
                  onClick={() => {
                    onSelectLedger(l);
                    onClose();
                  }}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #e2e8f0' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#2563eb' }}>{l.ledger_no}</td>
                  <td style={{ padding: '8px' }}>{l.ledger_date}</td>
                  <td style={{ padding: '8px', textTransform: 'capitalize' }}>{l.status}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>{Number(l.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="settle-modal-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn-sec" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default LedgerSearchModal;