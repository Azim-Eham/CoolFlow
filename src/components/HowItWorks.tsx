import React from 'react';
import { MessageSquare, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: MessageSquare,
      title: 'Request a Quote',
      description: 'Tell us about your needs in just a few clicks. Get a transparent, no-obligation estimate.',
    },
    {
      step: '02',
      icon: Calendar,
      title: 'Schedule a Visit',
      description: "We'll find a convenient time for you, complete with real-time technician arrival tracking.",
    },
    {
      step: '03',
      icon: CheckCircle,
      title: 'Enjoy the Comfort',
      description: 'Our certified experts get the job done right the first time so you can relax in total comfort.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0a1124] relative overflow-hidden">
      
      {/* Background Accent Grid / Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-cool-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-cool-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cool-400" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Get Comfortable in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cool-300 to-sky-400">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            A frictionless, transparent experience from first contact to perfect indoor climate.
          </p>
        </div>

        {/* 3 Step Cards with Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative group p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cool-500/30 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cool-950/60"
              >
                {/* Step Number & Icon Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-cool-600/15 border border-cool-500/30 flex items-center justify-center text-cool-400 group-hover:scale-110 group-hover:bg-cool-600 group-hover:text-white transition-all duration-300 shadow-md">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-5xl font-black text-slate-800 group-hover:text-slate-700 select-none transition-colors">
                    {item.step}
                  </span>
                </div>

                {/* Step Details */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-cool-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Step Progress indicator */}
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-cool-400">
                  <span>Step {index + 1} of 3</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

