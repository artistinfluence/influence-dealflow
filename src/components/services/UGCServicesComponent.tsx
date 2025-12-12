import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface UGCServicesData {
  standardUgcClipping: {
    enabled: boolean;
    targetViews: number;
    price: number;
    discount: number;
  };
  cultureEdits: {
    enabled: boolean;
    targetViews: number;
    price: number;
    discount: number;
  };
  trendingPush: {
    enabled: boolean;
    price: number;
    discount: number;
  };
  creatorFlood: {
    enabled: boolean;
    price: number;
    discount: number;
  };
}

interface UGCServicesComponentProps {
  data: UGCServicesData & { enabled: boolean; totalPrice: number };
  onUpdate: (updates: Partial<UGCServicesData>) => void;
}

const UGCServicesComponent: React.FC<UGCServicesComponentProps> = ({ data, onUpdate }) => {
  const CPM_RATE = 1.5;
  const MIN_STANDARD_VIEWS = 200000;
  const MIN_CULTURE_VIEWS = 666667;

  const calculateViewPrice = (views: number) => Math.round((views / 1000) * CPM_RATE);

  const handleStandardViewsChange = (views: number) => {
    const price = calculateViewPrice(views);
    onUpdate({
      ...data,
      standardUgcClipping: {
        ...data.standardUgcClipping,
        targetViews: views,
        price,
      },
    });
  };

  const handleCultureViewsChange = (views: number) => {
    const price = calculateViewPrice(views);
    onUpdate({
      ...data,
      cultureEdits: {
        ...data.cultureEdits,
        targetViews: views,
        price,
      },
    });
  };

  const toggleSubService = (service: keyof UGCServicesData) => {
    onUpdate({
      ...data,
      [service]: {
        ...data[service],
        enabled: !data[service].enabled,
      },
    });
  };

  const handleDiscountUpdate = (service: keyof UGCServicesData, discount: number, maxDiscount: number) => {
    onUpdate({
      ...data,
      [service]: {
        ...data[service],
        discount: Math.min(maxDiscount, Math.max(0, discount)),
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Standard UGC Clipping */}
      <div className="space-y-4 p-4 border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bebas tracking-wide text-base">STANDARD UGC CLIPPING</h4>
            <p className="text-xs text-muted-foreground">$1.50 per 1,000 views • 2-3 week campaign</p>
            <p className="text-xs text-muted-foreground">Minimum: 200K views ($300)</p>
          </div>
          <Switch
            checked={data.standardUgcClipping.enabled}
            onCheckedChange={() => toggleSubService('standardUgcClipping')}
          />
        </div>

        {data.standardUgcClipping.enabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target Views: {data.standardUgcClipping.targetViews.toLocaleString()}</Label>
              <Slider
                value={[data.standardUgcClipping.targetViews]}
                onValueChange={([views]) => handleStandardViewsChange(views)}
                min={MIN_STANDARD_VIEWS}
                max={2000000}
                step={50000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>200K</span>
                <span className="font-bold">{formatCurrency(data.standardUgcClipping.price)}</span>
                <span>2M</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="standard-ugc-discount">Discount (max 20%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="standard-ugc-discount"
                  type="number"
                  min="0"
                  max="20"
                  value={data.standardUgcClipping.discount || ''}
                  onChange={(e) => handleDiscountUpdate('standardUgcClipping', Number(e.target.value), 20)}
                  placeholder="0"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Culture Edits */}
      <div className="space-y-4 p-4 border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bebas tracking-wide text-base">CULTURE EDITS</h4>
            <p className="text-xs text-muted-foreground">$1.50 per 1,000 views • 2-3 week campaign</p>
            <p className="text-xs text-muted-foreground">Minimum: 667K views ($1,000)</p>
          </div>
          <Switch
            checked={data.cultureEdits.enabled}
            onCheckedChange={() => toggleSubService('cultureEdits')}
          />
        </div>

        {data.cultureEdits.enabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target Views: {data.cultureEdits.targetViews.toLocaleString()}</Label>
              <Slider
                value={[data.cultureEdits.targetViews]}
                onValueChange={([views]) => handleCultureViewsChange(views)}
                min={MIN_CULTURE_VIEWS}
                max={3000000}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>667K</span>
                <span className="font-bold">{formatCurrency(data.cultureEdits.price)}</span>
                <span>3M</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="culture-edits-discount">Discount (max 20%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="culture-edits-discount"
                  type="number"
                  min="0"
                  max="20"
                  value={data.cultureEdits.discount || ''}
                  onChange={(e) => handleDiscountUpdate('cultureEdits', Number(e.target.value), 20)}
                  placeholder="0"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top 50 Trending / Popular Tab Push */}
      <div className="space-y-4 p-4 border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bebas tracking-wide text-base">TOP 50 TRENDING / POPULAR TAB PUSH</h4>
            <p className="text-xs text-muted-foreground">Flat {formatCurrency(7500)} • 2-3 week campaign</p>
            <p className="text-xs text-muted-foreground">Guaranteed trending placement across platforms</p>
          </div>
          <Switch
            checked={data.trendingPush.enabled}
            onCheckedChange={() => toggleSubService('trendingPush')}
          />
        </div>

        {data.trendingPush.enabled && (
          <div className="space-y-4">
            <div className="p-3 bg-primary/10 rounded border border-primary/20">
              <p className="text-sm">Price: <span className="font-bold">{formatCurrency(7500)}</span></p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trending-push-discount">Discount (max 10%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="trending-push-discount"
                  type="number"
                  min="0"
                  max="10"
                  value={data.trendingPush.discount || ''}
                  onChange={(e) => handleDiscountUpdate('trendingPush', Number(e.target.value), 10)}
                  placeholder="0"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Creator Flood */}
      <div className="space-y-4 p-4 border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bebas tracking-wide text-base">CREATOR FLOOD</h4>
            <p className="text-xs text-muted-foreground">Flat {formatCurrency(7500)} • 3-4 week campaign</p>
            <p className="text-xs text-muted-foreground">10,000+ real TikTok UGC posts</p>
          </div>
          <Switch
            checked={data.creatorFlood.enabled}
            onCheckedChange={() => toggleSubService('creatorFlood')}
          />
        </div>

        {data.creatorFlood.enabled && (
          <div className="space-y-4">
            <div className="p-3 bg-primary/10 rounded border border-primary/20">
              <p className="text-sm">Price: <span className="font-bold">{formatCurrency(7500)}</span></p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creator-flood-discount">Discount (max 10%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="creator-flood-discount"
                  type="number"
                  min="0"
                  max="10"
                  value={data.creatorFlood.discount || ''}
                  onChange={(e) => handleDiscountUpdate('creatorFlood', Number(e.target.value), 10)}
                  placeholder="0"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UGCServicesComponent;
