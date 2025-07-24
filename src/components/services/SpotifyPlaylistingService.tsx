import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpotifyPlaylistingServiceProps {
  selectedPackage: string;
  onUpdate: (packageValue: string, price: number) => void;
}

const packages = [
  { value: '10000', label: '10,000 Streams - $200', price: 200 },
  { value: '20000', label: '20,000 Streams - $350', price: 350 },
  { value: '30000', label: '30,000 Streams - $500', price: 500 },
  { value: '40000', label: '40,000 Streams - $650', price: 650 },
  { value: '50000', label: '50,000 Streams - $850', price: 850 },
  { value: '60000', label: '60,000 Streams - $1,000', price: 1000 },
  { value: '70000', label: '70,000 Streams - $1,150', price: 1150 },
  { value: '80000', label: '80,000 Streams - $1,300', price: 1300 },
  { value: '90000', label: '90,000 Streams - $1,400', price: 1400 },
  { value: '100000', label: '100,000 Streams - $1,500', price: 1500 },
  { value: '125000', label: '125,000 Streams - $1,800', price: 1800 },
  { value: '150000', label: '150,000 Streams - $2,100', price: 2100 },
  { value: '200000', label: '200,000 Streams - $2,700', price: 2700 },
  { value: '250000', label: '250,000 Streams - $3,600', price: 3600 },
  { value: '500000', label: '500,000 Streams - $7,000', price: 7000 },
  { value: '1000000', label: '1,000,000+ Streams - Contact Us', price: 0 },
];

const SpotifyPlaylistingService: React.FC<SpotifyPlaylistingServiceProps> = ({ 
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
          <SelectValue placeholder="Select streaming package" />
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
              100% Organic Playlist Placement
            </p>
            <p className="text-xs text-muted-foreground">
              Weekly reporting • Performance tracking • Genre-specific playlists
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyPlaylistingService;