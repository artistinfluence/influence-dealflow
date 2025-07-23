import { YouTubeAdSection } from '@/components/services/YouTubeAdsService';

export interface CampaignData {
  youtubeAds: {
    enabled: boolean;
    sections: YouTubeAdSection[];
    totalPrice: number;
  };
  spotifyPlaylisting: {
    enabled: boolean;
    selectedPackage: string;
    price: number;
  };
  soundcloudReposts: {
    enabled: boolean;
    selectedPackage: string;
    price: number;
  };
  instagramSeeding: {
    enabled: boolean;
    budget: number;
    price: number;
  };
  metaTiktokAds: {
    enabled: boolean;
    platform: string;
    budget: number;
    price: number;
  };
}

export const getDefaultCampaignData = (): CampaignData => ({
  youtubeAds: {
    enabled: false,
    sections: [{
      id: Date.now().toString(),
      platform: '',
      targetViews: 0,
      price: 0,
    }],
    totalPrice: 0,
  },
  spotifyPlaylisting: {
    enabled: false,
    selectedPackage: '',
    price: 0,
  },
  soundcloudReposts: {
    enabled: false,
    selectedPackage: '',
    price: 0,
  },
  instagramSeeding: {
    enabled: false,
    budget: 0,
    price: 0,
  },
  metaTiktokAds: {
    enabled: false,
    platform: '',
    budget: 0,
    price: 0,
  },
});