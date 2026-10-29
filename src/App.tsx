import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { WhyChooseUs } from './components/WhyChooseUs';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { QuoteSection } from './components/QuoteSection';
import { Footer } from './components/Footer';
import { QuoteModal } from './components/QuoteModal';

export const App: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('AC Repair & Installation');
  const [isPureVideoActive, setIsPureVideoActive] = useState(false);

  const handleOpenQuoteWithService = (serviceName: string) => {
    setSelectedService(serviceName === 'All Services' ? 'AC Repair & Installation' : serviceName);
    setIsQuoteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 flex flex-col font-sans selection:bg-cool-500 selection:text-white">
      {/* Top Navbar: Automatically hides when in pure cinematic video mode */}
      <Navbar
        onOpenQuote={() => setIsQuoteModalOpen(true)}
        isHidden={isPureVideoActive}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero
          onOpenQuote={() => setIsQuoteModalOpen(true)}
          onHeroStateChange={(isPure) => setIsPureVideoActive(isPure)}
        />
        
        <Services onSelectService={handleOpenQuoteWithService} />
        
        <WhyChooseUs onOpenQuote={() => setIsQuoteModalOpen(true)} />
        
        <HowItWorks />
        
        <Testimonials />
        
        <QuoteSection initialService={selectedService} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Global Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        preselectedService={selectedService}
      />
    </div>
  );
};

export default App;
