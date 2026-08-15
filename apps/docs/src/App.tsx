import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import Overview from './pages/Overview';
import Identity from './pages/Identity';
import Notarization from './pages/Notarization';
import Integration from './pages/Integration';
import { useState, useEffect } from 'react';

export default function App() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-tawf-sand">
      <header>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-tawf-sand/90 backdrop-blur-md border-b border-tawf-green/10" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-tawf-green rounded-xl flex items-center justify-center">
                <span className="font-serif text-tawf-gold text-lg font-medium">T</span>
              </div>
              <span className="font-serif text-xl text-tawf-green">tawf-sdk</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className={`text-sm font-medium tracking-widest uppercase transition-colors ${pathname === '/' ? 'text-tawf-green' : 'text-tawf-ink/70 hover:text-tawf-green'}`}>
                Overview
              </Link>
              <Link to="/identity" className={`text-sm font-medium tracking-widest uppercase transition-colors ${pathname === '/identity' ? 'text-tawf-green' : 'text-tawf-ink/70 hover:text-tawf-green'}`}>
                Identity
              </Link>
              <Link to="/notarization" className={`text-sm font-medium tracking-widest uppercase transition-colors ${pathname === '/notarization' ? 'text-tawf-green' : 'text-tawf-ink/70 hover:text-tawf-green'}`}>
                Notarization
              </Link>
              <Link
                to="/integration"
                className="flex items-center gap-2 border border-tawf-green text-tawf-green px-6 py-2.5 rounded-full text-sm font-medium tracking-widest uppercase hover:bg-tawf-green hover:text-tawf-sand transition-all duration-300"
              >
                Get Started
              </Link>
            </div>

            <button
              className="lg:hidden p-3 text-tawf-green min-h-[48px] min-w-[48px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-tawf-green/10 bg-white">
              <div className="px-6 py-4 space-y-4">
                <Link to="/" className="block text-sm font-medium tracking-widest uppercase text-tawf-ink/70 hover:text-tawf-green">Overview</Link>
                <Link to="/identity" className="block text-sm font-medium tracking-widest uppercase text-tawf-ink/70 hover:text-tawf-green">Identity</Link>
                <Link to="/notarization" className="block text-sm font-medium tracking-widest uppercase text-tawf-ink/70 hover:text-tawf-green">Notarization</Link>
                <Link to="/integration" className="block text-sm font-medium tracking-widest uppercase text-tawf-green border border-tawf-green px-6 py-2.5 rounded-full text-center">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-grow pt-20" id="main-content" role="main">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/identity" element={<Identity />} />
          <Route path="/notarization" element={<Notarization />} />
          <Route path="/integration" element={<Integration />} />
        </Routes>
      </main>

      <footer className="bg-tawf-ink text-white/60 py-16 border-t border-white/10" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-tawf-green rounded-xl flex items-center justify-center">
                <span className="font-serif text-tawf-gold text-lg font-medium">T</span>
              </div>
              <span className="font-serif text-xl text-white">tawf-sdk</span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed">
              TypeScript SDKs and contracts for the Tawf Islamic Foundation ecosystem.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium tracking-widest uppercase text-xs mb-6">SDK</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/identity" className="hover:text-tawf-gold transition-colors">Identity (Tawf ID)</Link></li>
              <li><Link to="/notarization" className="hover:text-tawf-gold transition-colors">Notarization (tawf-verify)</Link></li>
              <li><Link to="/integration" className="hover:text-tawf-gold transition-colors">Getting Started</Link></li>
              <li><a href="https://github.com/tawf-labs/tawf-sdk" target="_blank" rel="noopener noreferrer" className="hover:text-tawf-gold transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium tracking-widest uppercase text-xs mb-6">Tawf Ecosystem</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="https://tawf.foundation" className="hover:text-tawf-gold transition-colors">Foundation</a></li>
              <li><a href="https://waqf.tawf.foundation" className="hover:text-tawf-gold transition-colors">Cash Waqf</a></li>
              <li><a href="https://github.com/tawf-labs/tawf-gov" className="hover:text-tawf-gold transition-colors">Governance</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 text-xs">
          <p>&copy; {new Date().getFullYear()} Tawf Islamic Foundation. Apache 2.0</p>
        </div>
      </footer>
    </div>
  );
}