import React from 'react';
import { Switch } from '@/components/ui/switch';
import { CampaignData } from '@/types/campaign';
import YouTubeAdsService, { YouTubeAdSection } from './services/YouTubeAdsService';
import SpotifyPlaylistingService from './services/SpotifyPlaylistingService';
import SoundCloudRepostsService from './services/SoundCloudRepostsService';
import InstagramSeedingService from './services/InstagramSeedingService';
import MetaTikTokAdsService from './services/MetaTikTokAdsService';

interface CampaignBuilderProps {
  campaignData: CampaignData;
  onUpdate: (data: CampaignData) => void;
}

const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ campaignData, onUpdate }) => {
  const updateService = (service: keyof CampaignData, updates: any) => {
    onUpdate({
      ...campaignData,
      [service]: {
        ...campaignData[service],
        ...updates,
      },
    });
  };

  const toggleService = (service: keyof CampaignData) => {
    updateService(service, { enabled: !campaignData[service].enabled });
  };

  const handleYouTubeUpdate = (sections: YouTubeAdSection[]) => {
    const totalPrice = sections.reduce((sum, section) => sum + section.price, 0);
    updateService('youtubeAds', { sections, totalPrice });
  };

  const handleSpotifyUpdate = (selectedPackage: string, price: number) => {
    updateService('spotifyPlaylisting', { selectedPackage, price });
  };

  const handleSoundCloudUpdate = (selectedPackage: string, price: number) => {
    updateService('soundcloudReposts', { selectedPackage, price });
  };

  const handleInstagramUpdate = (budget: number) => {
    updateService('instagramSeeding', { budget, price: budget });
  };

  const handleMetaTikTokUpdate = (platform: string, budget: number) => {
    updateService('metaTiktokAds', { platform, budget, price: budget });
  };

  return (
    <div className="center-content space-y-8">
      <div className="center-content space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">2</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bebas tracking-wide">
            BUILD YOUR CAMPAIGN
          </h2>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {/* YouTube Advertising */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bebas tracking-wide">
                YOUTUBE ADVERTISING
              </h3>
            </div>
            <Switch
              checked={campaignData.youtubeAds.enabled}
              onCheckedChange={() => toggleService('youtubeAds')}
            />
          </div>
          
          {campaignData.youtubeAds.enabled && (
            <YouTubeAdsService
              sections={campaignData.youtubeAds.sections}
              onUpdate={handleYouTubeUpdate}
            />
          )}
        </div>

        {/* Spotify Playlisting */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bebas tracking-wide">
                SPOTIFY PLAYLISTING
              </h3>
            </div>
            <Switch
              checked={campaignData.spotifyPlaylisting.enabled}
              onCheckedChange={() => toggleService('spotifyPlaylisting')}
            />
          </div>
          
          {campaignData.spotifyPlaylisting.enabled && (
            <SpotifyPlaylistingService
              selectedPackage={campaignData.spotifyPlaylisting.selectedPackage}
              onUpdate={handleSpotifyUpdate}
            />
          )}
        </div>

        {/* SoundCloud Reposts */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bebas tracking-wide">
                SOUNDCLOUD REPOSTS
              </h3>
            </div>
            <Switch
              checked={campaignData.soundcloudReposts.enabled}
              onCheckedChange={() => toggleService('soundcloudReposts')}
            />
          </div>
          
          {campaignData.soundcloudReposts.enabled && (
            <SoundCloudRepostsService
              selectedPackage={campaignData.soundcloudReposts.selectedPackage}
              onUpdate={handleSoundCloudUpdate}
            />
          )}
        </div>

        {/* Instagram Seeding */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bebas tracking-wide">
                INSTAGRAM SEEDING
              </h3>
            </div>
            <Switch
              checked={campaignData.instagramSeeding.enabled}
              onCheckedChange={() => toggleService('instagramSeeding')}
            />
          </div>
          
          {campaignData.instagramSeeding.enabled && (
            <InstagramSeedingService
              budget={campaignData.instagramSeeding.budget}
              onUpdate={handleInstagramUpdate}
            />
          )}
        </div>

        {/* Meta & TikTok Ads */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bebas tracking-wide">
                META & TIKTOK ADS
              </h3>
            </div>
            <Switch
              checked={campaignData.metaTiktokAds.enabled}
              onCheckedChange={() => toggleService('metaTiktokAds')}
            />
          </div>
          
          {campaignData.metaTiktokAds.enabled && (
            <MetaTikTokAdsService
              platform={campaignData.metaTiktokAds.platform}
              budget={campaignData.metaTiktokAds.budget}
              onUpdate={handleMetaTikTokUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignBuilder;