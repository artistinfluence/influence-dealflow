import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://xvxqekfiqbuvwaupbcjo.supabase.co";
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey!);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientDetails, campaignData, recipientEmail } = await req.json();

    // Generate proposal content using OpenAI
    const proposalContent = await generateProposalContent(clientDetails, campaignData);
    
    // Send email via Resend
    const emailResponse = await sendProposalEmail(recipientEmail, clientDetails, proposalContent, campaignData);
    
    // Track proposal in database
    const totalAmount = calculateTotalAmount(campaignData);
    await supabase.from('proposals').insert({
      artist_name: clientDetails.artistName,
      song_title: clientDetails.songTitle,
      recipient_email: recipientEmail,
      total_amount: totalAmount,
      services_included: campaignData,
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-proposal function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate proposal' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateProposalContent(clientDetails: any, campaignData: any) {
  const activeServices = getActiveServices(campaignData);
  const totalAmount = calculateTotalAmount(campaignData);
  
  const prompt = `Generate a professional campaign proposal for Artist Influence with the following details:

Artist: ${clientDetails.artistName}
Song: "${clientDetails.songTitle}"
Genre: ${clientDetails.genre}
Artist Tier: ${clientDetails.tier || 'Not specified'}
Release Date: ${new Date(clientDetails.releaseDate).toLocaleDateString()}

Active Services:
${activeServices.map(service => `- ${service.name}: ${service.details} - $${service.price}`).join('\n')}

Total Campaign Cost: $${totalAmount.toLocaleString()}

Generate 5 campaign objectives based on the selected services, genre, and artist tier. Make them specific and actionable for ${clientDetails.genre} music promotion. Consider the artist's tier (${clientDetails.tier || 'emerging'}) when setting realistic expectations and goals.

Also generate campaign goals that are realistic and genre-specific for ${clientDetails.genre} artists at the ${clientDetails.tier || 'emerging'} level.

Keep the tone professional but energetic, matching Artist Influence's brand.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional music marketing strategist creating campaign proposals for Artist Influence. Be specific, actionable, and exciting while maintaining professionalism.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function sendProposalEmail(recipientEmail: string, clientDetails: any, aiContent: string, campaignData: any) {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);
  
  const emailHtml = generateEmailTemplate(clientDetails, aiContent, validUntil, campaignData);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Artist Influence <proposals@artistinfluence.com>',
      to: [recipientEmail],
      subject: `Campaign Proposal: ${clientDetails.artistName} - ${clientDetails.songTitle}`,
      html: emailHtml,
    }),
  });

  return await response.json();
}

function generateEmailTemplate(clientDetails: any, aiContent: string, validUntil: Date, campaignData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000, #F23041); color: white; padding: 30px; text-align: center; margin-bottom: 30px; }
            .title { font-family: Impact, sans-serif; font-size: 32px; margin: 0; letter-spacing: 2px; }
            .section { margin-bottom: 30px; }
            .section-title { font-family: Impact, sans-serif; font-size: 18px; color: #F23041; margin-bottom: 15px; letter-spacing: 1px; }
            .cost-breakdown { background: #f8f9fa; padding: 20px; border-left: 4px solid #F23041; }
            .total { font-size: 24px; font-weight: bold; color: #F23041; text-align: center; padding: 20px; border: 2px solid #F23041; margin: 20px 0; }
            .disclaimer { font-size: 12px; color: #666; background: #f8f9fa; padding: 15px; margin-top: 30px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">📄 CAMPAIGN PROPOSAL</div>
        </div>
        
        <div class="section">
            <div class="section-title">PREPARED BY:</div>
            <p>Artist Influence</p>
        </div>
        
        <div class="section">
            <div class="section-title">FOR:</div>
            <p>${clientDetails.artistName} – "${clientDetails.songTitle}"</p>
        </div>
        
        <div class="section">
            <div class="section-title">VALID UNTIL:</div>
            <p>${validUntil.toLocaleDateString('en-US')}</p>
        </div>
        
        <div class="section">
            <div class="section-title">🎯 CAMPAIGN GOALS & OBJECTIVES</div>
            <div style="white-space: pre-line;">${aiContent}</div>
        </div>
        
        <div class="total">
            Total Campaign Investment: $${calculateTotalAmount(campaignData).toLocaleString()}
        </div>
        
        <div class="section">
            <div class="section-title">📦 SERVICE DESCRIPTIONS</div>
            <p><strong>SPOTIFY PLAYLISTING:</strong> We run fully organic Spotify campaigns that place your music on third-party playlists curated for your genre, helping you reach real listeners—not bots—and trigger Spotify's algorithm.</p>
            <p><strong>SOUNDCLOUD REPOSTS:</strong> We tap into an underground network of verified SoundCloud artists and labels to organically repost your track across genre-specific communities.</p>
            <p><strong>YOUTUBE ADVERTISING:</strong> Our YouTube ad campaigns turn music videos into highly optimized promotional assets using strategic international targeting and our proprietary view-to-engagement ratio engine.</p>
            <p><strong>INSTAGRAM SEEDING:</strong> Instagram seeding places your music on genre-aligned fan pages where your target audience already hangs out.</p>
            <p><strong>META & TIKTOK ADS:</strong> Our social media campaigns deliver targeted reach through optimized ad placements across Facebook, Instagram, and TikTok.</p>
        </div>
        
        <div class="disclaimer">
            <div class="section-title">⚠️ DISCLAIMER</div>
            <p>Artist Influence, LLC makes every attempt to ensure the accuracy and reliability of services offered in this document. The information is provided "as is" without warranty. Services are subject to availability and adjustment based on market conditions.</p>
            <p>Please do not share this document externally unless you are legally bound in the assistance and wellbeing of ${clientDetails.artistName} or the "${clientDetails.songTitle}" campaign.</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #F23041; color: white;">
            <p style="margin: 0; font-weight: bold;">Ready to proceed? Contact your sales representative to finalize this campaign.</p>
        </div>
    </body>
    </html>
  `;
}

function getActiveServices(campaignData: any) {
  const services = [];
  
  if (campaignData.youtubeAds?.enabled) {
    services.push({
      name: 'YouTube Advertising',
      details: `${campaignData.youtubeAds.sections?.length || 0} campaign(s)`,
      price: campaignData.youtubeAds.totalPrice || 0
    });
  }
  
  if (campaignData.spotifyPlaylisting?.enabled) {
    services.push({
      name: 'Spotify Playlisting',
      details: `${campaignData.spotifyPlaylisting.selectedPackage} streams package`,
      price: campaignData.spotifyPlaylisting.price || 0
    });
  }
  
  if (campaignData.soundcloudReposts?.enabled) {
    services.push({
      name: 'SoundCloud Reposts',
      details: `${campaignData.soundcloudReposts.selectedPackage} package`,
      price: campaignData.soundcloudReposts.price || 0
    });
  }
  
  if (campaignData.instagramSeeding?.enabled) {
    services.push({
      name: 'Instagram Seeding',
      details: `$${campaignData.instagramSeeding.budget || 0} budget`,
      price: campaignData.instagramSeeding.price || 0
    });
  }
  
  if (campaignData.metaTiktokAds?.enabled) {
    services.push({
      name: 'Meta & TikTok Ads',
      details: `${campaignData.metaTiktokAds.platform} - $${campaignData.metaTiktokAds.budget || 0} budget`,
      price: campaignData.metaTiktokAds.price || 0
    });
  }
  
  return services;
}

function calculateTotalAmount(campaignData: any): number {
  let total = 0;
  
  if (campaignData.youtubeAds?.enabled) {
    total += campaignData.youtubeAds.totalPrice || 0;
  }
  if (campaignData.spotifyPlaylisting?.enabled) {
    total += campaignData.spotifyPlaylisting.price || 0;
  }
  if (campaignData.soundcloudReposts?.enabled) {
    total += campaignData.soundcloudReposts.price || 0;
  }
  if (campaignData.instagramSeeding?.enabled) {
    total += campaignData.instagramSeeding.price || 0;
  }
  if (campaignData.metaTiktokAds?.enabled) {
    total += campaignData.metaTiktokAds.price || 0;
  }
  
  return total;
}