import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050913] text-slate-400 pt-16 pb-12 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cool-400 to-cool-600 p-0.5">
                <div className="w-full h-full bg-[#070c18] rounded-[10px] flex items-center justify-center p-1">
                  <img src="/logo-icon.svg" alt="CoolFlow" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">Cool<span className="text-cool-400">Flow</span></span>
                <span className="block text-[10px] tracking-widest uppercase font-semibold text-slate-400 -mt-1">
                  HVAC Solutions
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Reliable heating, cooling, and indoor air solutions for a more comfortable tomorrow. Precision engineering for residential & commercial spaces.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {['Facebook', 'Instagram', 'LinkedIn', 'YouTube'].map((net) => (
                <a
                  key={net}
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cool-400 hover:border-cool-400/40 transition-colors text-xs font-bold"
                  aria-label={net}
                >
                  {net[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#hero" className="hover:text-cool-400 transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-cool-400 transition-colors">Services</a></li>
              <li><a href="#why-us" className="hover:text-cool-400 transition-colors">Why Us</a></li>
              <li><a href="#how-it-works" className="hover:text-cool-400 transition-colors">How It Works</a></li>
              <li><a href="#reviews" className="hover:text-cool-400 transition-colors">Reviews</a></li>
              <li><a href="#contact" className="hover:text-cool-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-cool-400 transition-colors">AC Repair & Installation</a></li>
              <li><a href="#services" className="hover:text-cool-400 transition-colors">Heating Services</a></li>
              <li><a href="#services" className="hover:text-cool-400 transition-colors">Indoor Air Quality</a></li>
              <li><a href="#services" className="hover:text-cool-400 transition-colors">Maintenance Plans</a></li>
              <li><a href="#services" className="hover:text-cool-400 transition-colors">Emergency Service</a></li>
            </ul>
          </div>

          {/* Contact Us + Location Card */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cool-400 shrink-0" />
                <a href="tel:5551234567" className="hover:text-white">(555) 123-4567</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cool-400 shrink-0" />
                <a href="mailto:hello@coolflowhvac.com" className="hover:text-white">hello@coolflowhvac.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-cool-400 shrink-0 mt-0.5" />
                <span>123 Comfort Lane, Austin, TX 78701</span>
              </li>
            </ul>

            {/* Serving Austin Badge (Matching the inspiration footer widget) */}
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cool-600/20 border border-cool-500/30 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-cool-400" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Serving Austin</div>
                <div className="text-slate-400 text-[11px]">& Surrounding Areas</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & policies */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} CoolFlow HVAC Solutions. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

