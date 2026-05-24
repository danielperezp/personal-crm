import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Customers', path: '/customers' },
  { label: 'Invoices', path: '/invoices' },
  { label: 'Payments', path: '/payments' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Receipts', path: '/receipts' },
  { label: 'Bills', path: '/bills' },
  { label: 'Subscriptions', path: '/subscriptions' },
  { label: 'Utilities', path: '/utilities' },
  { label: 'Orders', path: '/orders' },
  { label: 'Purchases', path: '/purchases' },
  { label: 'Projects', path: '/projects' },
  { label: 'Assets', path: '/assets' },
  { label: 'Investments', path: '/investments' },
  { label: 'Accountability', path: '/accountability' },
  { label: 'Settings', path: '/settings' },
];

export function SidebarNav() {
  return (
    <nav className="mt-4 space-y-1 px-2">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
