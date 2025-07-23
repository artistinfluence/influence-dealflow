import React from 'react';
import { Input } from '@/components/ui/input';

interface InstagramSeedingServiceProps {
  budget: number;
  onUpdate: (budget: number) => void;
}

const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const InstagramSeedingService: React.FC<InstagramSeedingServiceProps> = ({ 
  budget, 
  onUpdate 
}) => {
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const number = parseInt(value) || 0;
    onUpdate(number);
  };

  const adSpend = Math.floor(budget * 0.7);
  const minViews = adSpend > 0 ? Math.floor(adSpend / 0.18) : 0;
  const maxViews = adSpend > 0 ? Math.floor(adSpend / 0.00003) : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Minimum budget $350"
          value={budget ? formatNumber(budget) : ''}
          onChange={handleBudgetChange}
          className="bg-card border-border text-center"
        />
        {budget > 0 && budget < 350 && (
          <p className="text-destructive text-xs text-center">
            Minimum budget is $350
          </p>
        )}
      </div>
      
      {budget >= 350 && (
        <div className="center-content space-y-3 p-4 bg-card rounded border border-border">
          <div className="text-center space-y-1">
            <p className="text-sm">
              <span className="font-bebas">Ad Spend:</span> ${formatNumber(adSpend)}
            </p>
            <p className="text-sm text-muted-foreground">
              Expected Views: {formatNumber(minViews)} - {formatNumber(maxViews)}
            </p>
          </div>
          
          <div className="text-xs text-center text-muted-foreground border-t border-border pt-2">
            <p>Note: 30% management fee applies</p>
            <p>Audio seeding & viral content creation included</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramSeedingService;