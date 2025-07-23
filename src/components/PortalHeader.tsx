import React from 'react';

const PortalHeader: React.FC = () => {
  return (
    <header className="portal-header sticky top-0 z-50 w-full py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bebas gradient-text tracking-wider">
          ARTIST INFLUENCE
        </h1>
        
        <div className="px-4 py-2 border border-primary/50 rounded-md">
          <span className="text-sm md:text-base font-bebas text-primary tracking-wide">
            SALES PORTAL
          </span>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;