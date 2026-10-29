import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenQuote: () => void;
  isHidden?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuote, isHidden = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Services', href: '#services' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out will-change-transform ${
        isHidden
          ? 'opacity-0 -translate-y-full pointer-events-none'
          : 'opacity-100 translate-y-0 pointer-events-auto'
      } ${
        scrolled
          ? 'bg-[#080e1d]/90 backdrop-blur-md py-3 shadow-lg shadow-black/30 border-b border-white/5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cool-400 to-cool-600 p-0.5 shadow-md shadow-cool-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#070c18] rounded-[10px] flex items-center justify-center p-1.5">
                <img src="/logo-icon.svg" alt="CoolFlow" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xl font-extrabold tracking-tight text-white">Cool<span className="text-cool-400">Flow</span></span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 -mt-1">
                HVAC Solutions
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cool-400 hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:5551234567"
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-sm font-semibold transition-all duration-200"
            >
              <Phone className="w-4 h-4 text-cool-400 animate-pulse" />
              <span>(555) 123-4567</span>
            </a>

            <button
              onClick={onOpenQuote}
              className="relative group overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cool-600 to-cool-500 hover:from-cool-500 hover:to-cool-400 text-white text-sm font-bold shadow-lg shadow-cool-600/30 hover:shadow-cool-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Get a Quote</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <a
              href="tel:5551234567"
              className="p-2 rounded-full bg-slate-900 border border-white/10 text-cool-400"
              aria-label="Call Now"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a1124] border-b border-white/10 px-6 py-6 mt-2 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-cool-400 py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <a
              href="tel:5551234567"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-slate-200 font-semibold border border-white/10"
            >
              <Phone className="w-4 h-4 text-cool-400" />
              (555) 123-4567
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cool-600 hover:bg-cool-500 text-white font-bold shadow-md shadow-cool-600/30"
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
