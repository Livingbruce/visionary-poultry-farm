import { UserPlus, Users, Banknote, ClipboardList } from 'lucide-react';

export const folders = [
  {
    id: 'onboarding',
    title: 'Onboarding',
    desc: 'Add new owners, staff, and auditors.',
    icon: UserPlus,
  },
  {
    id: 'manage',
    title: 'Manage Staff',
    desc: 'Manage staff, auditors, leaves, layoffs, halts, etc.',
    icon: Users,
  },
  {
    id: 'salaries',
    title: 'Salaries',
    desc: 'Manage farm employees wages & salaries here.',
    icon: Banknote,
  },
  {
    id: 'performance',
    title: 'Performance Logs',
    desc: 'Supervise employee activities in the system.',
    icon: ClipboardList,
  },
];