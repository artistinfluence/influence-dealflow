import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

export interface YouTubeAdSection {
  id: string;
  platform: string;
  targetViews: number;
  price: number;
}

interface YouTubeAdsServiceProps {
  sections: YouTubeAdSection[];
  onUpdate: (sections: YouTubeAdSection[]) => void;
}

const platforms = [
  { value: 'WW Skip', label: 'WW Skip' },
  { value: 'WW Website', label: 'WW Website' },
  { value: 'USA Website - $13 CPM', label: 'USA Website - $13 CPM' },
  { value: 'LATAM Website - $5.60 CPM', label: 'LATAM Website - $5.60 CPM' },
  { value: 'EUR/AUS Website - $12 CPM', label: 'EUR/AUS Website - $12 CPM' },
  { value: 'WW Display - $7 CPM', label: 'WW Display - $7 CPM' },
  { value: 'LATAM Display - $5.60 CPM', label: 'LATAM Display - $5.60 CPM' },
  { value: 'EUR/AUS/CAD Display - $12 CPM', label: 'EUR/AUS/CAD Display - $12 CPM' },
  { value: 'ASIA Display - $6 CPM', label: 'ASIA Display - $6 CPM' },
  { value: 'ASIA Website - $5 CPM', label: 'ASIA Website - $5 CPM' },
];

const calculatePrice = (platform: string, views: number): number => {
  if (platform === 'WW Skip') {
    if (views <= 10000) return 35;
    if (views <= 100000) return 35 + ((views - 10000) / 90000) * 315;
    if (views <= 1000000) return 350 + ((views - 100000) / 900000) * 2650;
    return 3000 + ((views - 1000000) / 1000000) * 3000;
  }
  
  if (platform === 'WW Website') {
    if (views <= 50000) return 150;
    if (views <= 100000) return 150 + ((views - 50000) / 50000) * 150;
    if (views <= 1000000) return 300 + ((views - 100000) / 900000) * 2200;
    return 2500 + ((views - 1000000) / 1000000) * 2500;
  }
  
  // For CPM-based platforms, extract CPM from label
  const cpmMatch = platform.match(/\$(\d+(?:\.\d+)?)\s*CPM/);
  if (cpmMatch) {
    const cpm = parseFloat(cpmMatch[1]);
    return (views / 1000) * cpm;
  }
  
  return 0;
};

const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const YouTubeAdsService: React.FC<YouTubeAdsServiceProps> = ({ sections, onUpdate }) => {
  const addSection = () => {
    const newSection: YouTubeAdSection = {
      id: Date.now().toString(),
      platform: '',
      targetViews: 0,
      price: 0,
    };
    onUpdate([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    onUpdate(sections.filter(section => section.id !== id));
  };

  const updateSection = (id: string, updates: Partial<YouTubeAdSection>) => {
    onUpdate(sections.map(section => {
      if (section.id === id) {
        const updated = { ...section, ...updates };
        if (updates.platform || updates.targetViews !== undefined) {
          updated.price = calculatePrice(updated.platform, updated.targetViews);
        }
        return updated;
      }
      return section;
    }));
  };

  const handleViewsChange = (id: string, value: string) => {
    const numericValue = parseInt(value.replace(/,/g, '')) || 0;
    updateSection(id, { targetViews: numericValue });
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={section.id} className="bg-secondary/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bebas tracking-wide">AD TYPE {index + 1}</span>
            {sections.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSection(section.id)}
                className="text-destructive hover:text-destructive/80 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              value={section.platform}
              onValueChange={(value) => updateSection(section.id, { platform: value })}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-48">
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Target views"
              value={section.targetViews ? formatNumber(section.targetViews) : ''}
              onChange={(e) => handleViewsChange(section.id, e.target.value)}
              className="bg-card border-border"
            />
          </div>
          
          {section.price > 0 && (
            <div className="text-center p-2 bg-primary/10 rounded border border-primary/20">
              <span className="font-bebas text-lg text-primary">
                ${formatNumber(section.price)}
              </span>
            </div>
          )}
        </div>
      ))}
      
      <Button
        onClick={addSection}
        variant="outline"
        className="w-full center-content gap-2 bg-card border-border hover:bg-accent whitespace-nowrap"
      >
        <Plus className="h-4 w-4" />
        ADD ANOTHER AD TYPE
      </Button>
    </div>
  );
};

export default YouTubeAdsService;