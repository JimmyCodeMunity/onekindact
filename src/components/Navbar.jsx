import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-stone-900">
          <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </span>
          OneKindAct
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/',          label: 'Home'      },
            { to: '/campaigns', label: 'Campaigns' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-brand-600 bg-brand-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/campaigns" className="hidden md:inline-flex btn-primary text-sm py-2 px-4">
            <Heart className="w-4 h-4" /> Donate Now
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-stone-100 px-4 pb-4 pt-2 flex flex-col gap-1 bg-white">
          <NavLink to="/"          end onClick={() => setOpen(false)} className="nav-link">Home</NavLink>
          <NavLink to="/campaigns"     onClick={() => setOpen(false)} className="nav-link">Campaigns</NavLink>
          <Link    to="/campaigns"     onClick={() => setOpen(false)} className="btn-primary mt-2 text-sm">
            <Heart className="w-4 h-4" /> Donate Now
          </Link>
        </div>
      )}
    </header>
  );
}
