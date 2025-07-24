import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { CampaignData } from '@/types/campaign';
import { ClientDetails } from './ClientDetailsForm';
import { generateProposal } from '@/lib/proposal-api';

interface ProposalGenerationProps {
  clientDetails: ClientDetails;
  campaignData: CampaignData;
  isFormValid: boolean;
}

const ProposalGeneration: React.FC<ProposalGenerationProps> = ({
  clientDetails,
  campaignData,
  isFormValid,
}) => {
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  const handleGenerateProposal = async () => {
    if (!isFormValid || !email) return;

    setIsGenerating(true);
    setLastResult(null);

    try {
      const result = await generateProposal(clientDetails, campaignData, email);
      
      setLastResult('success');
      toast({
        title: "Proposal sent successfully!",
        description: `Proposal has been sent to ${email}`,
      });
    } catch (error) {
      console.error('Error generating proposal:', error);
      setLastResult('error');
      toast({
        title: "Failed to send proposal",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isButtonDisabled = !isFormValid || !email || isGenerating;

  return (
    <div className="center-content space-y-6 p-8 border border-border rounded-lg bg-card">
      <h3 className="text-xl font-bebas tracking-wide">
        PROPOSAL GENERATION
      </h3>
      
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bebas tracking-wide block">
            SEND PROPOSAL TO:
          </label>
          <Input
            type="email"
            placeholder="your.email@artistinfluence.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-center bg-background border-border focus:ring-primary"
            disabled={isGenerating}
          />
        </div>
        
        <Button
          onClick={handleGenerateProposal}
          disabled={isButtonDisabled}
          className="w-full py-3 text-lg font-bebas tracking-wide bg-primary hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              GENERATING PROPOSAL...
            </div>
          ) : (
            'GENERATE & SEND PROPOSAL'
          )}
        </Button>
        
        {lastResult && (
          <div className="center-content space-y-3">
            {lastResult === 'success' ? (
              <>
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Proposal sent successfully to {email}</span>
                </div>
                <div className="text-xs text-muted-foreground text-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                  ⚠️ Note: Check spam folder if email doesn't arrive within 5 minutes
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="text-xs px-4 py-2"
                >
                  Generate New Proposal
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Failed to send proposal. Please try again.</span>
              </div>
            )}
          </div>
        )}
        
        {!isFormValid && (
          <p className="text-xs text-muted-foreground text-center">
            Complete all required fields and select at least one service to generate proposal
          </p>
        )}
      </div>
    </div>
  );
};

export default ProposalGeneration;