import React from 'react';

export interface CommissionData {
  youtubeAds: number;
  spotifyPlaylisting: number;
  soundcloudReposts: number;
  instagramSeeding: number;
  metaTiktokAds: number;
}

interface CommissionTrackerProps {
  commissions: CommissionData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const CommissionTracker: React.FC<CommissionTrackerProps> = ({ commissions }) => {
  const total = Object.values(commissions).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-24">
      <h3 className="text-xl font-bebas tracking-wide text-center">
        YOUR COMMISSION
      </h3>
      
      <div className="space-y-3">
        <div className="commission-item flex justify-between text-sm">
          <span>YOUTUBE ADS</span>
          <span>{formatCurrency(commissions.youtubeAds)}</span>
        </div>
        
        <div className="commission-item flex justify-between text-sm">
          <span>SPOTIFY PLAYLISTING</span>
          <span>{formatCurrency(commissions.spotifyPlaylisting)}</span>
        </div>
        
        <div className="commission-item flex justify-between text-sm">
          <span>SOUNDCLOUD REPOSTS</span>
          <span>{formatCurrency(commissions.soundcloudReposts)}</span>
        </div>
        
        <div className="commission-item flex justify-between text-sm">
          <span>INSTAGRAM SEEDING</span>
          <span>{formatCurrency(commissions.instagramSeeding)}</span>
        </div>
        
        <div className="commission-item flex justify-between text-sm">
          <span>META & TIKTOK ADS</span>
          <span>{formatCurrency(commissions.metaTiktokAds)}</span>
        </div>
        
        <div className="border-t border-border pt-3">
          <div className="commission-item flex justify-between font-bold text-lg">
            <span>TOTAL</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionTracker;