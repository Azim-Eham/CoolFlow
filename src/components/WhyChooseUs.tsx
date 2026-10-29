import React, { useState } from 'react';
import { ShieldCheck, Clock, DollarSign, Star, ArrowRight, CheckCircle2, Award } from 'lucide-react';

interface WhyChooseUsProps {
  onOpenQuote: () => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onOpenQuote }) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const stats = [
    { value: '10+', label: 'Years of Experience' },
    { value: '5,000+', label: 'Happy Customers' },
    { value: '4.9 ★', label: 'Average Rating' },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Licensed & Certified Technicians',
      description: 'Trained professionals you can trust with rigorous background checks and NATE certifications.',
    },
    {
      icon: Clock,
      title: '24/7 Emergency Service',
      description: "We're here when you need us most with zero after-hours penalty fees for club members.",
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'No hidden fees. Upfront fixed quotes provided before any work begins on your home.',
    },
    {
      icon: Star,
      title: 'Satisfaction Guaranteed',
      description: 'Your total indoor comfort is our priority. If you are not 100% happy, we make it right.',
    },
  ];

  return (
    <section id="why-us" className="py-24 bg-[#070c18] relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cool-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-cool-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cool-400" />
            Why Choose CoolFlow
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Trusted HVAC Experts for a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cool-300 via-cool-400 to-sky-400">
              Healthier, Happier Home
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            We combine expert service, quality products, and a customer-first approach to deliver long-lasting comfort across every season.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenQuote}
              className="px-6 py-3 rounded-full bg-cool-600 hover:bg-cool-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-cool-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Get a Free Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Column Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 py-8 px-6 sm:px-10 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center sm:items-start space-y-1 text-center sm:text-left">
              <span className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cool-300 tracking-tight">
                {stat.value}
              </span>
              <span className="text-sm font-semibold text-slate-400 tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Center Grid: Technician Photo Centerpiece + Feature List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left / Center Visual: High-res Technician at Work with interactive badge */}
          <div className="lg:col-span-7 relative group">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
              <img
                src="/images/technician-at-work.jpg"
                alt="CoolFlow Expert Technician at work"
                className="w-full h-[440px] sm:h-[500px] object-cover object-center filter brightness-95 contrast-105 group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-transparent to-transparent opacity-80" />

              {/* Floating Verified Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#080e1d]/90 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cool-500/20 border border-cool-400/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-cool-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">NATE-Certified Diagnostics</h4>
                    <p className="text-xs text-slate-300">Precision multi-point thermal and airflow verification</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  Active On-Site
                </span>
              </div>
            </div>
          </div>

          {/* Right: 4 Benefit Cards (matching the layout in inspiration image) */}
          <div className="lg:col-span-5 space-y-4">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 hover:border-cool-500/30 backdrop-blur-sm transition-all duration-300 flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 group-hover:border-cool-400/40 group-hover:bg-cool-600/10 flex items-center justify-center shrink-0 transition-all">
                    <Icon className="w-6 h-6 text-cool-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-cool-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

