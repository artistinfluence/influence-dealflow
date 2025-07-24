import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ClientDetails {
  artistName: string;
  songTitle: string;
  genre: string;
  tier: string;
  releaseDate: Date;
}

interface ClientDetailsFormProps {
  details: ClientDetails;
  onUpdate: (details: ClientDetails) => void;
}


const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({ details, onUpdate }) => {

  return (
    <div className="center-content space-y-6">
      <div className="center-content space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">1</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bebas tracking-wide">
            CLIENT DETAILS
          </h2>
        </div>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Artist or band name"
            value={details.artistName}
            onChange={(e) => onUpdate({ ...details, artistName: e.target.value })}
            className="text-center bg-card border-border focus:ring-primary"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Track or project name"
            value={details.songTitle}
            onChange={(e) => onUpdate({ ...details, songTitle: e.target.value })}
            className="text-center bg-card border-border focus:ring-primary"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Genre (e.g., EDM, Hip-Hop, Pop, etc.)"
            value={details.genre}
            onChange={(e) => onUpdate({ ...details, genre: e.target.value })}
            className="text-center bg-card border-border focus:ring-primary"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Select value={details.tier} onValueChange={(value) => onUpdate({ ...details, tier: value })}>
            <SelectTrigger className="text-center bg-card border-border focus:ring-primary">
              <SelectValue placeholder="Select artist tier" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="emerging" className="text-center justify-center">
                Emerging
              </SelectItem>
              <SelectItem value="mid-tier" className="text-center justify-center">
                Mid-Tier
              </SelectItem>
              <SelectItem value="established" className="text-center justify-center">
                Established
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-center text-center bg-card border-border hover:bg-accent",
                  !details.releaseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {details.releaseDate ? format(details.releaseDate, "PPP") : "Select release date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border-border" align="center">
              <Calendar
                mode="single"
                selected={details.releaseDate}
                onSelect={(date) => {
                  if (date) {
                    onUpdate({ ...details, releaseDate: date });
                    // Close the popover by triggering a click outside
                    setTimeout(() => {
                      document.body.click();
                    }, 100);
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsForm;