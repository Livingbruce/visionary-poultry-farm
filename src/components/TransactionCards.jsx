import { TrendingUp, ShoppingBag, CreditCard, Users, Info } from 'lucide-react';

export const categories = [
    {
      id: 'sales',
      title: 'Sales',
      amount: '$5,000',
      description: 'Record & track your poultry sales transactions.',
      icon: TrendingUp,
      colorClass: 'sales'
    },
    {
      id: 'purchases',
      title: 'Purchases',
      amount: '$3,000',
      description: 'Record & track your poultry purchases transactions.',
      icon: ShoppingBag,
      colorClass: 'purchases'
    },
    {
      id: 'creditors',
      title: 'Creditors',
      amount: '$2,000',
      description: 'Record & track your poultry creditors transactions.',
      icon: CreditCard,
      colorClass: 'creditors'
    },
    {
      id: 'debtors',
      title: 'Debtors',
      amount: '$4,000',
      description: 'Record & track your poultry debtors transactions.',
      icon: Users,
      colorClass: 'debtors'
    },
    {
      id: 'expenses',
      title: 'Expenses',
      amount: '$1,500',
      description: 'Record & track your poultry farm expenses transactions.',
      icon: Info,
      colorClass: 'expenses'
    }
  ];

