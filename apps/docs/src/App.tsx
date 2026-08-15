import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { BookOpen, ShieldCheck, Puzzle, Code2, ExternalLink } from 'lucide-react';
import Overview from './pages/Overview';
import Identity from './pages/Identity';
import Notarization from './pages/Notarization';
import Integration from './pages/Integration';

const NAV = [
  { to: '/', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
  { to: '/identity', label: 'Identity', icon: <ShieldCheck className="w-4 h-4" /> },
  { to: '/notarization', label: 'Notarization', icon: <Puzzle className="w-4 h-4" /> },
  { to: '/integration', label: 'Integration', icon: <Code2 className="w-4 h-4" /> },
];

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-tawf-sand">
      <header className="sticky top-0 z-50 bg-tawf-sand/90 backdrop-blur-md border-b border-tawf-green/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-tawf-green rounded-lg flex items-center justify-center">
              <span className="text-tawf-gold font-bold text-sm">T</span>
            </div>
            <span className="font-serif text-xl text-tawf-green tracking-tight">tawf-sdk</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium tracking-widest uppercase transition-colors ${
                  pathname === item.to
                    ? 'text-tawf-green'
                    : 'text-tawf-muted hover:text-tawf-green'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://github.com/tawf-labs/tawf-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-tawf-green text-tawf-sand px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-tawf-green-light transition-colors"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Mobile nav */}
          <nav className="md:hidden flex gap-4">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.icon}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/identity" element={<Identity />} />
          <Route path="/notarization" element={<Notarization />} />
          <Route path="/integration" element={<Integration />} />
        </Routes>
      </main>

      <footer className="bg-tawf-ink text-white/40 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs tracking-wider uppercase">
          tawf-sdk &middot; Apache 2.0 &middot;{' '}
          <a href="https://tawf.foundation" className="hover:text-tawf-gold transition-colors">
            tawf.foundation
          </a>
        </div>
      </footer>
    </div>
  );
}