import { TrendingUp, ShoppingBag, Users, CreditCard,  Receipt, Activity } from 'lucide-react';

export const reportTypes = [
    {
      id: 'sales-report',
      title: 'Sales Report',
      description: 'View sales reports for your poultry farm.',
      icon: TrendingUp,
      colorClass: 'sales'
    },
    {
      id: 'purchases-report',
      title: 'Purchases Report',
      description: 'View purchases reports for your poultry farm.',
      icon: ShoppingBag,
      colorClass: 'purchases'
    },
    {
      id: 'debtors-report',
      title: 'Debtors Report',
      description: 'View debtors reports for your poultry farm.',
      icon: Users,
      colorClass: 'debtors'
    },
    {
      id: 'creditors-report',
      title: 'Creditors Report',
      description: 'View creditors reports for your poultry farm.',
      icon: CreditCard,
      colorClass: 'creditors'
    },
    {
      id: 'expenses-report',
      title: 'Expenses Report',
      description: 'View expenses reports for your poultry farm.',
      icon: Receipt,
      colorClass: 'expenses'
    },
    {
      id: 'performance-report',
      title: 'Farm Performance Report',
      description: 'View performance reports for your poultry farm.',
      icon: Activity,
      colorClass: 'performance'
    }
  ];