import React, { useState } from 'react';
import PortalHeader from '@/components/PortalHeader';
import ClientDetailsForm, { ClientDetails } from '@/components/ClientDetailsForm';
import CampaignBuilder from '@/components/CampaignBuilder';
import CommissionTracker, { CommissionData } from '@/components/CommissionTracker';
import CampaignSummary from '@/components/CampaignSummary';
import ProposalGeneration from '@/components/ProposalGeneration';
import { CampaignData, getDefaultCampaignData } from '@/types/campaign';

const SalesPortal: React.FC = () => {
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    artistName: '',
    songTitle: '',
    genre: '',
    tier: '',
    releaseDate: new Date(),
  });
  const [campaignData, setCampaignData] = useState<CampaignData>(getDefaultCampaignData());

  const calculateCommissions = (campaignData: CampaignData): CommissionData => {
    const calculateGrossCommission = (price: number) => price * 0.2;
    const calculateNetCommission = (price: number) => price * 0.3 * 0.2;
    
    // Apply per-service discount to prices
    const applyServiceDiscount = (price: number, discount: number) => {
      return price * (1 - discount / 100);
    };

    // UGC Services commission calculations
    const calculateUGCCommission = (price: number, rate: number) => price * rate;

    const standardUgcClipping = campaignData.ugcServices?.enabled && campaignData.ugcServices.standardUgcClipping?.enabled 
      ? calculateUGCCommission(applyServiceDiscount(campaignData.ugcServices.standardUgcClipping.price, campaignData.ugcServices.standardUgcClipping.discount), 0.125) 
      : 0;

    const cultureEdits = campaignData.ugcServices?.enabled && campaignData.ugcServices.cultureEdits?.enabled 
      ? calculateUGCCommission(applyServiceDiscount(campaignData.ugcServices.cultureEdits.price, campaignData.ugcServices.cultureEdits.discount), 0.125) 
      : 0;

    const trendingPush = campaignData.ugcServices?.enabled && campaignData.ugcServices.trendingPush?.enabled 
      ? calculateUGCCommission(applyServiceDiscount(7500, campaignData.ugcServices.trendingPush.discount), 0.10) 
      : 0;

    const creatorFlood = campaignData.ugcServices?.enabled && campaignData.ugcServices.creatorFlood?.enabled 
      ? calculateUGCCommission(applyServiceDiscount(7500, campaignData.ugcServices.creatorFlood.discount), 0.10) 
      : 0;

    return {
      youtubeAds: campaignData.youtubeAds.enabled ? calculateGrossCommission(applyServiceDiscount(campaignData.youtubeAds.totalPrice, campaignData.youtubeAds.discount)) : 0,
      spotifyPlaylisting: campaignData.spotifyPlaylisting.enabled ? calculateGrossCommission(applyServiceDiscount(campaignData.spotifyPlaylisting.price, campaignData.spotifyPlaylisting.discount)) : 0,
      soundcloudReposts: campaignData.soundcloudReposts.enabled ? calculateGrossCommission(applyServiceDiscount(campaignData.soundcloudReposts.price, campaignData.soundcloudReposts.discount)) : 0,
      instagramSeeding: campaignData.instagramSeeding.enabled ? calculateNetCommission(applyServiceDiscount(campaignData.instagramSeeding.price, campaignData.instagramSeeding.discount)) : 0,
      metaTiktokAds: campaignData.metaTiktokAds.enabled ? calculateNetCommission(applyServiceDiscount(campaignData.metaTiktokAds.price, campaignData.metaTiktokAds.discount)) : 0,
      standardUgcClipping,
      cultureEdits,
      trendingPush,
      creatorFlood,
    };
  };

  const isFormValid = () => {
    const detailsValid = clientDetails.artistName && 
                        clientDetails.songTitle && 
                        clientDetails.genre &&
                        clientDetails.tier;
    
    const hasActiveServices = Object.values(campaignData).some(service => service.enabled && 
      ((service as any).price > 0 || (service as any).totalPrice > 0));
    
    return detailsValid && hasActiveServices;
  };

  const commissions = calculateCommissions(campaignData);

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-12">
            <ClientDetailsForm
              details={clientDetails}
              onUpdate={setClientDetails}
            />
            
            <CampaignBuilder
              campaignData={campaignData}
              onUpdate={setCampaignData}
            />
            
            <CampaignSummary campaignData={campaignData} />
            
            <ProposalGeneration
              clientDetails={clientDetails}
              campaignData={campaignData}
              isFormValid={isFormValid()}
            />
          </div>
          
          <div className="lg:col-span-1">
            <CommissionTracker commissions={commissions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesPortal;