import { useState, useEffect } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import SalesTable from '../tables/SalesTable';
import PurchasesTable from '../tables/PurchasesTable';
import ExpenseTable from '../tables/ExpenseTable';
import CreditorTable from '../tables/CreditorTable';
import DebtorTable from '../tables/DebtorTable';
import { supabase } from '../libs/supabase';
import '../styles/Transactions.css';
import { categories } from '../components/TransactionCards';

function Transactions() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [totals, setTotals] = useState({
    sales: 'KES 0.00',
    purchases: 'KES 0.00',
    expenses: 'KES 0.00',
    creditors: 'KES 0.00',
    debtors: 'KES 0.00',
  });
  const [loadingTotals, setLoadingTotals] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFarmAndTotals() {
      try {
        setLoadingTotals(true);
        const { data: membership, error: memberError } = await supabase
          .from('farm_members')
          .select('farm_id')
          .limit(1)
          .maybeSingle();

        if (memberError || !membership) {
          if (isMounted) setLoadingTotals(false);
          return;
        }

        const farmId = membership.farm_id;

        // 1. Fetch Sales Total
        const { data: salesLedgers } = await supabase
          .from('sales_ledgers')
          .select('total')
          .eq('farm_id', farmId);
        const salesSum = (salesLedgers || []).reduce((acc, l) => acc + (Number(l.total) || 0), 0);

        // 2. Fetch Purchases Total
        const { data: purchaseLedgers } = await supabase
          .from('purchase_ledgers')
          .select('total')
          .eq('farm_id', farmId);
        const purchasesSum = (purchaseLedgers || []).reduce((acc, l) => acc + (Number(l.total) || 0), 0);

        // 3. Fetch Expenses Total
        const { data: expenseLedgers } = await supabase
          .from('expense_ledgers')
          .select('total')
          .eq('farm_id', farmId);
        const expensesSum = (expenseLedgers || []).reduce((acc, l) => acc + (Number(l.total) || 0), 0);

        // 4. Fetch Creditors Net Balance (Credit Purchases - Settlements)
        const { data: creditPurchases } = await supabase
          .from('purchase_entries')
          .select('amount, payment_type, ledger:ledger_id!inner(farm_id)')
          .ilike('payment_type', '%credit%')
          .eq('ledger.farm_id', farmId);
        const totalCreditPurchases = (creditPurchases || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        const { data: creditorSettlements } = await supabase
          .from('creditor_settlements')
          .select('amount_settled')
          .eq('farm_id', farmId);
        const totalCreditorPaid = (creditorSettlements || []).reduce((acc, s) => acc + (Number(s.amount_settled) || 0), 0);
        const creditorsBalance = Math.max(0, totalCreditPurchases - totalCreditorPaid);

        // 5. Fetch Debtors Net Balance (Credit Sales - Settlements)
        const { data: creditSales } = await supabase
          .from('sales_entries')
          .select('amount, payment_type, ledger:ledger_id!inner(farm_id)')
          .or('payment_type.ilike.%credit%,payment_type.ilike.%debt%')
          .eq('ledger.farm_id', farmId);
        const totalCreditSales = (creditSales || []).reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

        const { data: debtorSettlements } = await supabase
          .from('debtor_settlements')
          .select('amount_paid')
          .eq('farm_id', farmId);
        const totalDebtorPaid = (debtorSettlements || []).reduce((acc, ds) => acc + (Number(ds.amount_paid) || 0), 0);
        const debtorsBalance = Math.max(0, totalCreditSales - totalDebtorPaid);

        if (isMounted) {
          setTotals({
            sales: `KES ${salesSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purchases: `KES ${purchasesSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            expenses: `KES ${expensesSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            creditors: `KES ${creditorsBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            debtors: `KES ${debtorsBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          });
          setLoadingTotals(false);
        }
      } catch (err) {
        console.error("Error fetching transaction summary totals:", err);
        if (isMounted) setLoadingTotals(false);
      }
    }

    loadFarmAndTotals();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  if (selectedCategory === 'sales') {
    return <SalesTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
  } else if (selectedCategory === 'purchases') {
    return <PurchasesTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
  } else if (selectedCategory === 'expenses') {
    return <ExpenseTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
  } else if (selectedCategory === 'creditors') {
    return <CreditorTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
  } else if (selectedCategory === 'debtors') {
    return <DebtorTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
  }

  return (
    <div className="page transactions-container">
      <div className="page-header">
        <h1>Transactions</h1>
        <p>View and manage your poultry farm transactions.</p>
      </div>

      <div className="page-content transaction-grid">
        {categories.map((item) => {
          const Icon = item.icon;
          const displayAmount = totals[item.id] || item.amount;
          return (
            <div 
              key={item.id} 
              className={`transaction-card ${item.colorClass}`}
              onClick={() => setSelectedCategory(item.id)}
            >
              <div className="card-top">
                <div className="icon-badge">
                  <Icon size={22} />
                </div>
                <div className="arrow-indicator">
                  <ArrowRight size={18} />
                </div>
              </div>

              <div className="card-body">
                <h2>{item.title}</h2>
                <div className="transaction-details" id={`${item.id}-transactions`}>
                  {loadingTotals ? 'Loading KES...' : displayAmount}
                </div>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="page-footer">
        <Info size={16} />
        <p>Click on a card to view the detailed ledger table for that transaction category[cite: 17].</p>
      </div>
    </div>
  );
}

export default Transactions;