import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CampaignData } from '@/types/campaign';
import YouTubeAdsService, { YouTubeAdSection } from './services/YouTubeAdsService';
import SpotifyPlaylistingService from './services/SpotifyPlaylistingService';
import SoundCloudRepostsService from './services/SoundCloudRepostsService';
import InstagramSeedingService from './services/InstagramSeedingService';
import MetaTikTokAdsService from './services/MetaTikTokAdsService';
import UGCServicesComponent from './services/UGCServicesComponent';

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

  const handleUGCUpdate = (updates: any) => {
    // Calculate total price from all enabled sub-services
    const standardPrice = updates.standardUgcClipping?.enabled ? updates.standardUgcClipping.price : 0;
    const culturePrice = updates.cultureEdits?.enabled ? updates.cultureEdits.price : 0;
    const trendingPrice = updates.trendingPush?.enabled ? 7500 : 0;
    const creatorPrice = updates.creatorFlood?.enabled ? 10000 : 0;
    const totalPrice = standardPrice + culturePrice + trendingPrice + creatorPrice;

    updateService('ugcServices', { ...updates, totalPrice });
  };

  const handleServiceDiscountUpdate = (service: keyof CampaignData, discount: number) => {
    updateService(service, { discount });
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
            <div className="space-y-4">
              <YouTubeAdsService
                sections={campaignData.youtubeAds.sections}
                onUpdate={handleYouTubeUpdate}
              />
              <div className="space-y-2">
                <Label htmlFor="youtube-discount">Discount (max 20%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="youtube-discount"
                    type="number"
                    min="0"
                    max="20"
                    value={campaignData.youtubeAds.discount || ''}
                    onChange={(e) => handleServiceDiscountUpdate('youtubeAds', Math.min(20, Number(e.target.value)))}
                    placeholder="0"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
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
            <div className="space-y-4">
              <SpotifyPlaylistingService
                selectedPackage={campaignData.spotifyPlaylisting.selectedPackage}
                onUpdate={handleSpotifyUpdate}
              />
              <div className="space-y-2">
                <Label htmlFor="spotify-discount">Discount (max 20%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="spotify-discount"
                    type="number"
                    min="0"
                    max="20"
                    value={campaignData.spotifyPlaylisting.discount || ''}
                    onChange={(e) => handleServiceDiscountUpdate('spotifyPlaylisting', Math.min(20, Number(e.target.value)))}
                    placeholder="0"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
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
            <div className="space-y-4">
              <SoundCloudRepostsService
                selectedPackage={campaignData.soundcloudReposts.selectedPackage}
                onUpdate={handleSoundCloudUpdate}
              />
              <div className="space-y-2">
                <Label htmlFor="soundcloud-discount">Discount (max 20%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="soundcloud-discount"
                    type="number"
                    min="0"
                    max="20"
                    value={campaignData.soundcloudReposts.discount || ''}
                    onChange={(e) => handleServiceDiscountUpdate('soundcloudReposts', Math.min(20, Number(e.target.value)))}
                    placeholder="0"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
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
            <div className="space-y-4">
              <InstagramSeedingService
                budget={campaignData.instagramSeeding.budget}
                onUpdate={handleInstagramUpdate}
              />
              <div className="space-y-2">
                <Label htmlFor="instagram-discount">Discount (max 5%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="instagram-discount"
                    type="number"
                    min="0"
                    max="5"
                    value={campaignData.instagramSeeding.discount || ''}
                    onChange={(e) => handleServiceDiscountUpdate('instagramSeeding', Math.min(5, Number(e.target.value)))}
                    placeholder="0"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
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
            <div className="space-y-4">
              <MetaTikTokAdsService
                platform={campaignData.metaTiktokAds.platform}
                budget={campaignData.metaTiktokAds.budget}
                onUpdate={handleMetaTikTokUpdate}
              />
              <div className="space-y-2">
                <Label htmlFor="meta-discount">Discount (max 5%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="meta-discount"
                    type="number"
                    min="0"
                    max="5"
                    value={campaignData.metaTiktokAds.discount || ''}
                    onChange={(e) => handleServiceDiscountUpdate('metaTiktokAds', Math.min(5, Number(e.target.value)))}
                    placeholder="0"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* UGC Services */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bebas tracking-wide">
                UGC SERVICES
              </h3>
              <p className="text-xs text-muted-foreground">User-generated content campaigns</p>
            </div>
            <Switch
              checked={campaignData.ugcServices.enabled}
              onCheckedChange={() => toggleService('ugcServices')}
            />
          </div>
          
          {campaignData.ugcServices.enabled && (
            <UGCServicesComponent
              data={campaignData.ugcServices}
              onUpdate={handleUGCUpdate}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default CampaignBuilder;