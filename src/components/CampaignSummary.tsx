import React from 'react';
import { CampaignData } from '@/types/campaign';

interface CampaignSummaryProps {
  campaignData: CampaignData;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const CampaignSummary: React.FC<CampaignSummaryProps> = ({ campaignData }) => {
  const getActiveServices = () => {
    const services = [];

    if (campaignData.youtubeAds.enabled && campaignData.youtubeAds.totalPrice > 0) {
      const activeSections = campaignData.youtubeAds.sections.filter(s => s.price > 0);
      const sectionDetails = activeSections.map(s => 
        `${s.platform.split(' - ')[0]} (${s.targetViews.toLocaleString()} views)`
      ).join(', ');
      services.push({
        name: 'YOUTUBE ADVERTISING',
        details: sectionDetails || `${activeSections.length} campaign(s) configured`,
        price: campaignData.youtubeAds.totalPrice,
      });
    }

    if (campaignData.spotifyPlaylisting.enabled && campaignData.spotifyPlaylisting.price > 0) {
      const packageData = campaignData.spotifyPlaylisting.selectedPackage;
      const streams = parseInt(packageData).toLocaleString();
      services.push({
        name: 'SPOTIFY PLAYLISTING',
        details: `${streams} streams package`,
        price: campaignData.spotifyPlaylisting.price,
      });
    }

    if (campaignData.soundcloudReposts.enabled && campaignData.soundcloudReposts.price > 0) {
      services.push({
        name: 'SOUNDCLOUD REPOSTS',
        details: 'Network distribution package',
        price: campaignData.soundcloudReposts.price,
      });
    }

    if (campaignData.instagramSeeding.enabled && campaignData.instagramSeeding.price > 0) {
      services.push({
        name: 'INSTAGRAM SEEDING',
        details: `$${campaignData.instagramSeeding.budget.toLocaleString()} budget`,
        price: campaignData.instagramSeeding.price,
      });
    }

    if (campaignData.metaTiktokAds.enabled && campaignData.metaTiktokAds.price > 0) {
      const platformLabel = campaignData.metaTiktokAds.platform === 'both' 
        ? 'Meta + TikTok' 
        : campaignData.metaTiktokAds.platform === 'meta' 
        ? 'Meta' 
        : 'TikTok';
      services.push({
        name: 'META & TIKTOK ADS',
        details: `${platformLabel} - $${campaignData.metaTiktokAds.budget.toLocaleString()} budget`,
        price: campaignData.metaTiktokAds.price,
      });
    }

    return services;
  };

  const activeServices = getActiveServices();
  const totalPrice = activeServices.reduce((sum, service) => sum + service.price, 0);

  if (activeServices.length === 0) {
    return (
      <div className="center-content space-y-4 p-8 border border-border rounded-lg bg-card/50">
        <h3 className="text-xl font-bebas tracking-wide text-muted-foreground">
          CAMPAIGN SUMMARY
        </h3>
        <p className="text-muted-foreground text-center">
          No services selected yet. Enable services above to see your campaign summary.
        </p>
      </div>
    );
  }

  return (
    <div className="center-content space-y-6 p-8 border border-primary/20 rounded-lg bg-gradient-to-br from-card to-secondary/50">
      <h3 className="text-xl font-bebas tracking-wide">
        CAMPAIGN SUMMARY
      </h3>
      
      <div className="w-full max-w-2xl space-y-4">
        {activeServices.map((service, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-background/50 rounded border border-border/50"
          >
            <div className="text-left">
              <h4 className="font-bebas text-sm tracking-wide">
                {service.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {service.details}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold">
                {formatCurrency(service.price)}
              </span>
            </div>
          </div>
        ))}
        
        <div className="border-t border-primary/20 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bebas tracking-wide">
              CAMPAIGN TOTAL
            </span>
            <span className="text-2xl font-bebas text-primary">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignSummary;