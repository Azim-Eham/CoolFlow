import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Phone, ShieldCheck } from 'lucide-react';

interface QuoteSectionProps {
  initialService?: string;
}

export const QuoteSection: React.FC<QuoteSectionProps> = ({ initialService = '' }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(initialService || 'AC Repair & Installation');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Mountain Sunset Panorama Background */}
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl min-h-[520px] flex items-center">
        <img
          src="/images/cta-mountain-sunset.jpg"
          alt="Fresh Mountain Air Vista"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.72] contrast-105"
        />
        
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070c18] via-[#070c18]/80 to-transparent w-full md:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070c18]/90 via-transparent to-transparent md:hidden" />

        <div className="relative z-10 w-full p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cool-500/30 text-cool-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-cool-400" />
                Ready For A More Comfortable Home?
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Let's Get Started Today
              </h2>

              <p className="text-slate-200 text-base sm:text-lg max-w-md font-normal leading-relaxed">
                Request a free, zero-obligation quote and experience the whisper-quiet CoolFlow difference with guaranteed satisfaction.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cool-400" />
                  <span>Free in-home assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cool-400" />
                  <span>Upfront guaranteed pricing</span>
                </div>
              </div>
            </div>

            {/* Right Card: Quote Form matching the inspiration design */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900">
                
                {submitted ? (
                  <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Thank You, {fullName.split(' ')[0]}!</h3>
                    <p className="text-sm text-slate-600">
                      Your quote request for <span className="font-bold text-cool-600">{service}</span> has been received. Our team will call you at <span className="font-bold">{phone}</span> within 15 minutes!
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      Send Another Request
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-5">
                      Get a Free Quote
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cool-500 focus:border-transparent text-sm bg-slate-50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cool-500 focus:border-transparent text-sm bg-slate-50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Service Needed
                        </label>
                        <select
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cool-500 focus:border-transparent text-sm bg-slate-50 text-slate-800 transition-all"
                        >
                          <option value="AC Repair & Installation">AC Repair & Installation</option>
                          <option value="Heating Services">Heating Services</option>
                          <option value="Indoor Air Quality">Indoor Air Quality</option>
                          <option value="Maintenance Plans">Maintenance Plans</option>
                          <option value="Emergency HVAC Diagnostics">24/7 Emergency HVAC Diagnostics</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-3.5 px-6 rounded-xl bg-cool-600 hover:bg-cool-500 active:bg-cool-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cool-600/30 transition-all"
                      >
                        <span>Send Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
};

