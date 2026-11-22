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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#EEF1EC]/90 backdrop-blur-md border-b border-[#AEBFB5]" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1">
              <img src="/images/tawftransparent.png" alt="Tawf" className="pt-2 h-24 w-auto invert" />
              <span className="text-lg font-medium tracking-[-0.03em] text-[#10261F] whitespace-nowrap">sdk</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className={`inline-flex min-h-11 items-center text-[15px] font-medium transition-colors ${pathname === '/' ? 'text-[#1F6B54]' : 'text-[#33473F] hover:text-[#10261F]'}`}>
                Overview
              </Link>
              <Link to="/identity" className={`inline-flex min-h-11 items-center text-[15px] font-medium transition-colors ${pathname === '/identity' ? 'text-[#1F6B54]' : 'text-[#33473F] hover:text-[#10261F]'}`}>
                Identity
              </Link>
              <Link to="/notarization" className={`inline-flex min-h-11 items-center text-[15px] font-medium transition-colors ${pathname === '/notarization' ? 'text-[#1F6B54]' : 'text-[#33473F] hover:text-[#10261F]'}`}>
                Notarization
              </Link>
              <Link
                to="/integration"
                className="inline-flex h-12 items-center rounded-xl bg-[#1F6B54] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#175545] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B54] focus-visible:ring-offset-2"
              >
                Get Started
              </Link>
            </div>

            <button
              className="lg:hidden p-3 text-[#10261F] min-h-[48px] min-w-[48px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-[#AEBFB5] bg-[#FBFCFA]">
              <div className="px-6 py-4 space-y-4">
                <Link to="/" className="flex min-h-11 items-center text-[15px] font-medium text-[#33473F] hover:text-[#10261F]">Overview</Link>
                <Link to="/identity" className="flex min-h-11 items-center text-[15px] font-medium text-[#33473F] hover:text-[#10261F]">Identity</Link>
                <Link to="/notarization" className="flex min-h-11 items-center text-[15px] font-medium text-[#33473F] hover:text-[#10261F]">Notarization</Link>
                <Link to="/integration" className="flex h-12 items-center justify-center rounded-xl bg-[#1F6B54] text-[15px] font-medium text-white">
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

      <footer className="bg-[#10261F] text-white/80 py-16 border-t border-white/10" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <img src="/images/tawftransparent.png" alt="Tawf" className="-ml-3 h-24 w-auto mb-2" />
            <h3 className="sr-only">tawf-sdk</h3>
            <p className="text-sm max-w-sm leading-relaxed">
              TypeScript SDKs and smart contracts for the Tawf Islamic Foundation ecosystem.
            </p>
          </div>

          <div>
            <h4 className="font-sans text-white font-medium text-sm mb-6">SDK</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/identity" className="hover:text-[#F2E3B5] transition-colors">Identity (Tawf ID)</Link></li>
              <li><Link to="/notarization" className="hover:text-[#F2E3B5] transition-colors">Notarization (tawf-verify)</Link></li>
              <li><Link to="/integration" className="hover:text-[#F2E3B5] transition-colors">Getting Started</Link></li>
              <li><a href="https://github.com/tawf-labs/tawf-sdk" target="_blank" rel="noopener noreferrer" className="hover:text-[#F2E3B5] transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-white font-medium text-sm mb-6">Tawf Ecosystem</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="https://tawf.foundation" className="hover:text-[#F2E3B5] transition-colors">Foundation</a></li>
              <li><a href="https://waqf.tawf.foundation" className="hover:text-[#F2E3B5] transition-colors">Cash Waqf</a></li>
              <li><a href="https://github.com/tawf-labs/tawf-gov" className="hover:text-[#F2E3B5] transition-colors">Governance</a></li>
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