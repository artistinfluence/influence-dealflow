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
        discount: campaignData.youtubeAds.discount,
      });
    }

    if (campaignData.spotifyPlaylisting.enabled && campaignData.spotifyPlaylisting.price > 0) {
      const packageData = campaignData.spotifyPlaylisting.selectedPackage;
      const streams = parseInt(packageData).toLocaleString();
      services.push({
        name: 'SPOTIFY PLAYLISTING',
        details: `${streams} streams package`,
        price: campaignData.spotifyPlaylisting.price,
        discount: campaignData.spotifyPlaylisting.discount,
      });
    }

    if (campaignData.soundcloudReposts.enabled && campaignData.soundcloudReposts.price > 0) {
      const pkg = campaignData.soundcloudReposts.selectedPackage;
      const reachMillions = pkg ? parseInt(pkg) : 0;
      const reachLabel = reachMillions > 0 ? `${reachMillions}M reach package` : 'Repost package';
      services.push({
        name: 'SOUNDCLOUD REPOSTS',
        details: reachLabel,
        price: campaignData.soundcloudReposts.price,
        discount: campaignData.soundcloudReposts.discount,
      });
    }

    if (campaignData.instagramSeeding.enabled && campaignData.instagramSeeding.price > 0) {
      const adSpend = Math.floor(campaignData.instagramSeeding.price * 0.7);
      services.push({
        name: 'INSTAGRAM SEEDING',
        details: `$${adSpend.toLocaleString()} budget`,
        price: campaignData.instagramSeeding.price,
        discount: campaignData.instagramSeeding.discount,
      });
    }

    if (campaignData.metaTiktokAds.enabled && campaignData.metaTiktokAds.price > 0) {
      const platformLabel = campaignData.metaTiktokAds.platform === 'both' 
        ? 'Meta + TikTok' 
        : campaignData.metaTiktokAds.platform === 'meta' 
        ? 'Meta' 
        : 'TikTok';
      const adSpend = Math.floor(campaignData.metaTiktokAds.price * 0.7);
      services.push({
        name: 'META & TIKTOK ADS',
        details: `${platformLabel} - $${adSpend.toLocaleString()} budget`,
        price: campaignData.metaTiktokAds.price,
        discount: campaignData.metaTiktokAds.discount,
      });
    }

    // UGC Services
    if (campaignData.ugcServices?.enabled) {
      if (campaignData.ugcServices.standardUgcClipping?.enabled && campaignData.ugcServices.standardUgcClipping.price > 0) {
        services.push({
          name: 'STANDARD UGC CLIPPING',
          details: `${campaignData.ugcServices.standardUgcClipping.targetViews.toLocaleString()} views`,
          price: campaignData.ugcServices.standardUgcClipping.price,
          discount: campaignData.ugcServices.standardUgcClipping.discount,
        });
      }

      if (campaignData.ugcServices.cultureEdits?.enabled && campaignData.ugcServices.cultureEdits.price > 0) {
        services.push({
          name: 'CULTURE EDITS',
          details: `${campaignData.ugcServices.cultureEdits.targetViews.toLocaleString()} views`,
          price: campaignData.ugcServices.cultureEdits.price,
          discount: campaignData.ugcServices.cultureEdits.discount,
        });
      }

      if (campaignData.ugcServices.trendingPush?.enabled) {
        services.push({
          name: 'TOP 50 TRENDING / POPULAR TAB PUSH',
          details: 'Guaranteed trending placement',
          price: 7500,
          discount: campaignData.ugcServices.trendingPush.discount,
        });
      }

      if (campaignData.ugcServices.creatorFlood?.enabled) {
        services.push({
          name: 'CREATOR FLOOD',
          details: '10,000+ TikTok UGC posts',
          price: 10000,
          discount: campaignData.ugcServices.creatorFlood.discount,
        });
      }
    }

    return services;
  };

  const activeServices = getActiveServices();
  const subtotal = activeServices.reduce((sum, service) => sum + service.price, 0);
  
  // Calculate total discount from all services
  const totalDiscountAmount = activeServices.reduce((sum, service) => {
    const discount = service.discount || 0;
    return sum + (service.price * (discount / 100));
  }, 0);
  
  const totalPrice = subtotal - totalDiscountAmount;

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
        {activeServices.map((service, index) => {
          const discountAmount = service.discount ? service.price * (service.discount / 100) : 0;
          const finalPrice = service.price - discountAmount;
          
          return (
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
                {service.discount > 0 && (
                  <p className="text-xs text-green-600">
                    {service.discount}% discount applied
                  </p>
                )}
              </div>
              <div className="text-right">
                {service.discount > 0 ? (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground line-through">
                      {formatCurrency(service.price)}
                    </span>
                    <br />
                    <span className="text-sm font-bold">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold">
                    {formatCurrency(service.price)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="border-t border-primary/20 pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-bebas tracking-wide">
              SUBTOTAL
            </span>
            <span className="text-base font-bebas">
              {formatCurrency(subtotal)}
            </span>
          </div>
          
          {totalDiscountAmount > 0 && (
            <div className="flex items-center justify-between text-green-600">
              <span className="text-base font-bebas tracking-wide">
                TOTAL DISCOUNTS
              </span>
              <span className="text-base font-bebas">
                -{formatCurrency(totalDiscountAmount)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between border-t border-primary/20 pt-2">
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