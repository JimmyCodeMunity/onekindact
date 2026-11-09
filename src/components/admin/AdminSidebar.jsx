import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, Megaphone, CreditCard,
  LogOut, Heart, ExternalLink, X
} from 'lucide-react';

const NAV = [
  { to: '/admin',           label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone                  },
  { to: '/admin/donations', label: 'Donations', icon: CreditCard                 },
];

export default function AdminSidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r border-stone-100">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-stone-100 flex-shrink-0">
        <div className="flex items-center gap-2.5 font-heading text-lg font-bold text-stone-900">
          <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </span>
          <span>OneKindAct</span>
          <span className="text-xs font-medium text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 lg:hidden">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-active' : ''}`
            }
          >
            <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-stone-100 space-y-1 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="nav-link text-sm"
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0" /> View Public Site
        </a>

        {/* User */}
        <div className="flex items-center gap-3 px-4 py-3 mt-1 rounded-xl bg-stone-50">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-stone-400 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-stone-200 transition" title="Logout">
            <LogOut className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}
