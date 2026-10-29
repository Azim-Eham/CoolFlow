import React, { useState } from 'react';
import { Snowflake, Flame, Wind, Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const services = [
    {
      id: 1,
      name: 'AC Repair & Installation',
      shortDesc: 'Stay cool with expert AC services.',
      fullDesc: 'Rapid diagnostics, precision refrigerant recharging, ductless mini-split setups, and high-efficiency central air installs.',
      icon: Snowflake,
      iconColor: 'text-cool-400 bg-cool-500/10 border-cool-400/20',
      badgeColor: 'border-cool-500/30 text-cool-300',
      image: '/images/service-ac-repair.jpg',
      features: ['Same-Day Emergency Repair', 'High SEER2 Upgrades', 'Refrigerant Leak Detection'],
    },
    {
      id: 2,
      name: 'Heating Services',
      shortDesc: 'Reliable heating for colder days.',
      fullDesc: 'Gas furnace repairs, dual-fuel heat pumps, boiler tune-ups, and energy-saving smart thermostat integrations.',
      icon: Flame,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-400/20',
      badgeColor: 'border-amber-500/30 text-amber-300',
      image: '/images/service-heating.jpg',
      features: ['Furnace Tune-Ups & Fixes', 'Cold-Climate Heat Pumps', 'Carbon Monoxide Testing'],
    },
    {
      id: 3,
      name: 'Indoor Air Quality',
      shortDesc: 'Cleaner, healthier air for your family.',
      fullDesc: 'Whole-house HEPA filtration, medical-grade UV germicidal lights, humidity control, and duct sanitization.',
      icon: Wind,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20',
      badgeColor: 'border-emerald-500/30 text-emerald-300',
      image: '/images/service-air-quality.jpg',
      features: ['Whole-Home UV Purifiers', 'Allergen & Dust Reduction', 'Humidity Management'],
    },
    {
      id: 4,
      name: 'Maintenance Plans',
      shortDesc: 'Keep your system running efficiently.',
      fullDesc: 'Comprehensive bi-annual system checkups, prioritized scheduling, 15% discount on parts, and zero overtime charges.',
      icon: Wrench,
      iconColor: 'text-sky-400 bg-sky-500/10 border-sky-400/20',
      badgeColor: 'border-sky-500/30 text-sky-300',
      image: '/images/service-maintenance.jpg',
      features: ['21-Point System Inspection', 'Priority VIP Scheduling', 'Extended Equipment Lifespan'],
    },
  ];

  return (
    <section id="services" className="py-24 bg-[#0a1122] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cool-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-cool-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cool-400" />
              Our Services
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Complete HVAC Solutions for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cool-300 to-sky-400">
                Every Season
              </span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
              From repairs to installations, we provide reliable HVAC services to keep your home comfortable, efficient, and healthy all year long.
            </p>
          </div>

          <button
            onClick={() => onSelectService('All Services')}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-sm font-semibold transition-all group shadow-sm"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 text-cool-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item) => {
            const Icon = item.icon;
            const isHovered = activeCard === item.id;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveCard(item.id)}
                onMouseLeave={() => setActiveCard(null)}
                className="group relative rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cool-400/40 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-cool-950/80 hover:-translate-y-1.5"
              >
                {/* Image Container with Floating Icon */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-95 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
                  
                  {/* Category Floating Icon */}
                  <div className={`absolute top-4 left-4 p-2.5 rounded-xl border backdrop-blur-md shadow-lg ${item.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cool-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed font-normal">
                      {item.shortDesc}
                    </p>
                  </div>

                  {/* Bullet features */}
                  <ul className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
                    {item.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cool-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Card Action */}
                  <button
                    onClick={() => onSelectService(item.name)}
                    className="w-full mt-4 flex items-center justify-between py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-cool-600/20 text-slate-200 hover:text-cool-300 border border-white/5 hover:border-cool-400/30 text-xs font-semibold transition-all group/btn"
                  >
                    <span>Request Service</span>
                    <div className="w-6 h-6 rounded-full bg-slate-800 group-hover/btn:bg-cool-600 flex items-center justify-center text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

