import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      quote:
        '"Awesome service! They fixed my AC the same day and were super professional. Highly recommend to anyone who values honest HVAC work!"',
      author: 'Sarah M.',
      role: 'Homeowner, Westlake',
      avatar: '/images/avatar-sarah.jpg',
      rating: 5,
    },
    {
      id: 2,
      quote:
        '"Professional, on time, and honest pricing. Our home has never been more comfortable, and our summer utility bills dropped by 22%."',
      author: 'James T.',
      role: 'Homeowner, Downtown Austin',
      avatar: '/images/avatar-james.jpg',
      rating: 5,
    },
    {
      id: 3,
      quote:
        '"The seasonal maintenance plan gives me total peace of mind. Great service, spotless cleanup, and wonderfully friendly technicians!"',
      author: 'Emily R.',
      role: 'Homeowner, Oak Hill',
      avatar: '/images/avatar-emily.jpg',
      rating: 5,
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="reviews" className="py-24 bg-[#070c18] relative overflow-hidden">
      
      {/* Ambient background light */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-cool-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header with Slider Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-cool-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cool-400" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              What Our Customers{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cool-300 to-sky-400">
                Are Saying
              </span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Real stories from homeowners who trust CoolFlow for their indoor comfort and HVAC solutions.
            </p>
          </div>

          {/* Navigation arrow buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 hover:border-cool-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
              aria-label="Previous Review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 hover:border-cool-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
              aria-label="Next Review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cool-500/30 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-cool-950/70"
            >
              <div className="space-y-5">
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-slate-200 text-base leading-relaxed italic">
                  {rev.quote}
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-8 pt-5 border-t border-white/10 flex items-center gap-4">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cool-500/40 shadow-md"
                />
                <div>
                  <h4 className="text-base font-bold text-white">{rev.author}</h4>
                  <p className="text-xs text-cool-300 font-medium">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

