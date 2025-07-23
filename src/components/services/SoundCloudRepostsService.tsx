import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SoundCloudRepostsServiceProps {
  selectedPackage: string;
  onUpdate: (packageValue: string, price: number) => void;
}

const packages = [
  { value: '5m', label: '5M Reach • ~7K Plays - $150', price: 150 },
  { value: '10m', label: '10M Reach • ~15K Plays - $300', price: 300 },
  { value: '20m', label: '20M Reach • ~40K Plays - $600', price: 600 },
  { value: '30m', label: '30M Reach • ~60K Plays - $850', price: 850 },
  { value: '40m', label: '40M Reach • ~75K Plays - $1,175', price: 1175 },
  { value: '60m', label: '60M Reach • ~100K Plays - $1,750', price: 1750 },
  { value: '80m', label: '80M Reach • ~125K Plays - $2,250', price: 2250 },
];

const SoundCloudRepostsService: React.FC<SoundCloudRepostsServiceProps> = ({ 
  selectedPackage, 
  onUpdate 
}) => {
  const handlePackageChange = (value: string) => {
    const packageData = packages.find(pkg => pkg.value === value);
    if (packageData) {
      onUpdate(value, packageData.price);
    }
  };

  return (
    <div className="space-y-4">
      <Select value={selectedPackage} onValueChange={handlePackageChange}>
        <SelectTrigger className="bg-card border-border">
          <SelectValue placeholder="Select repost package" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-48">
          {packages.map((pkg) => (
            <SelectItem key={pkg.value} value={pkg.value}>
              {pkg.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedPackage && (
        <div className="text-center p-3 bg-card rounded border border-border">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Underground network distribution
            </p>
            <p className="text-xs text-muted-foreground">
              Verified artists • Genre-specific communities • US-based listeners
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundCloudRepostsService;