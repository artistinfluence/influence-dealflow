import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MetaTikTokAdsServiceProps {
  platform: string;
  budget: number;
  onUpdate: (platform: string, budget: number) => void;
}

const platforms = [
  { value: 'meta', label: 'Meta (Facebook & Instagram)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'both', label: 'Both Platforms' },
];

const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const MetaTikTokAdsService: React.FC<MetaTikTokAdsServiceProps> = ({ 
  platform, 
  budget, 
  onUpdate 
}) => {
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const number = parseInt(value) || 0;
    onUpdate(platform, number);
  };

  const handlePlatformChange = (newPlatform: string) => {
    onUpdate(newPlatform, budget);
  };

  const adSpend = Math.floor(budget * 0.7);

  return (
    <div className="space-y-4">
      <Select value={platform} onValueChange={handlePlatformChange}>
        <SelectTrigger className="bg-card border-border">
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {platforms.map((plt) => (
            <SelectItem key={plt.value} value={plt.value}>
              {plt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="space-y-2">
        <Input
          placeholder="Minimum budget $750"
          value={budget ? formatNumber(budget) : ''}
          onChange={handleBudgetChange}
          className="bg-card border-border text-center"
        />
        {budget > 0 && budget < 750 && (
          <p className="text-destructive text-xs text-center">
            Minimum budget is $750
          </p>
        )}
      </div>
      
      {budget >= 750 && platform && (
        <div className="center-content space-y-3 p-4 bg-card rounded border border-border">
          <div className="text-center space-y-1">
            <p className="text-sm">
              <span className="font-bebas">Ad Spend:</span> ${formatNumber(adSpend)} (70% of budget)
            </p>
          </div>
          
          <div className="text-xs text-center text-muted-foreground border-t border-border pt-2">
            <p>Includes campaign optimization & weekly reporting</p>
            <p>A/B testing • Audience targeting • Performance tracking</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaTikTokAdsService;