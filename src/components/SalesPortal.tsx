import React, { useState, useEffect } from 'react';
import PasswordGate from '@/components/PasswordGate';
import PortalHeader from '@/components/PortalHeader';
import ClientDetailsForm, { ClientDetails } from '@/components/ClientDetailsForm';
import CampaignBuilder from '@/components/CampaignBuilder';
import CommissionTracker, { CommissionData } from '@/components/CommissionTracker';
import CampaignSummary from '@/components/CampaignSummary';
import ProposalGeneration from '@/components/ProposalGeneration';
import { CampaignData, getDefaultCampaignData } from '@/types/campaign';

const SalesPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    artistName: '',
    songTitle: '',
    genre: '',
    tier: '',
    releaseDate: new Date(),
  });
  const [campaignData, setCampaignData] = useState<CampaignData>(getDefaultCampaignData());

  useEffect(() => {
    const authStatus = localStorage.getItem('artistInfluenceAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const calculateCommissions = (campaignData: CampaignData): CommissionData => {
    const calculateGrossCommission = (price: number) => price * 0.2;
    const calculateNetCommission = (price: number) => price * 0.3 * 0.2;
    
    // Apply discount to prices if enabled
    const applyDiscount = (price: number) => {
      if (campaignData.discount.enabled && campaignData.discount.percentage > 0) {
        return price * (1 - campaignData.discount.percentage / 100);
      }
      return price;
    };

    return {
      youtubeAds: campaignData.youtubeAds.enabled ? calculateGrossCommission(applyDiscount(campaignData.youtubeAds.totalPrice)) : 0,
      spotifyPlaylisting: campaignData.spotifyPlaylisting.enabled ? calculateGrossCommission(applyDiscount(campaignData.spotifyPlaylisting.price)) : 0,
      soundcloudReposts: campaignData.soundcloudReposts.enabled ? calculateGrossCommission(applyDiscount(campaignData.soundcloudReposts.price)) : 0,
      instagramSeeding: campaignData.instagramSeeding.enabled ? calculateNetCommission(applyDiscount(campaignData.instagramSeeding.price)) : 0,
      metaTiktokAds: campaignData.metaTiktokAds.enabled ? calculateNetCommission(applyDiscount(campaignData.metaTiktokAds.price)) : 0,
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

  if (!isAuthenticated) {
    return <PasswordGate onLogin={handleLogin} />;
  }

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