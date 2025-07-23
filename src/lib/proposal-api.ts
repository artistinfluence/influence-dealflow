import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export async function generateProposal(clientDetails: any, campaignData: any, recipientEmail: string) {
  try {
    const response = await supabase.functions.invoke('generate-proposal', {
      body: {
        clientDetails,
        campaignData,
        recipientEmail,
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error generating proposal:', error);
    throw error;
  }
}