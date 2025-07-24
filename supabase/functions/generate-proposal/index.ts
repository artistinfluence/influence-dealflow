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
  
  const prompt = `Generate a professional campaign proposal for Artist Influence. Create two sections:

CAMPAIGN OBJECTIVES:
Write a brief 2-3 sentence overview describing the artist and their latest release, then explain how this campaign will support their goals. Use this format as inspiration:

"${clientDetails.artistName} is a ${clientDetails.tier?.toLowerCase() || 'emerging'} ${clientDetails.genre} artist. Their latest release, "${clientDetails.songTitle}", [describe the style/sound briefly]. To support the rollout, this campaign will [explain strategy based on selected services].

We'll combine [list selected services] to maximize ROI while maintaining organic alignment with ${clientDetails.artistName}'s sonic identity."

CAMPAIGN GOALS:
Generate 1 bullet point per service selected (maximum 5 goals) that are specific to each service being rendered. Focus on context and value, not filling space:

Artist: ${clientDetails.artistName}
Song: "${clientDetails.songTitle}"
Genre: ${clientDetails.genre}
Artist Tier: ${clientDetails.tier || 'Emerging'}
Release Date: ${new Date(clientDetails.releaseDate).toLocaleDateString()}

Selected Services:
${activeServices.map(service => `- ${service.name}: ${service.details}`).join('\n')}

Make goals specific to the services selected and avoid specific numbers. Focus on qualitative outcomes like "drive targeted views," "boost streaming growth," "generate new listeners," etc.

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
      text: emailHtml,
    }),
  });

  return await response.json();
}

function generateEmailTemplate(clientDetails: any, aiContent: string, validUntil: Date, campaignData: any): string {
  const activeServices = getActiveServices(campaignData);
  const totalAmount = calculateTotalAmount(campaignData);
  
  // Generate cost breakdown
  const costBreakdown = activeServices.map(service => 
    `${service.name}: ${service.details} - $${service.price.toLocaleString()}`
  ).join('\n');
  
  // Generate service descriptions for selected services only
  const serviceDescriptions = getServiceDescriptions(campaignData);
  
  return `📄 CAMPAIGN PROPOSAL

PREPARED BY: Artist Influence
FOR: ${clientDetails.artistName} – "${clientDetails.songTitle}"
VALID UNTIL: ${validUntil.toLocaleDateString('en-US')}

🎯 CAMPAIGN GOALS & OBJECTIVES

${aiContent}

💰 COST BREAKDOWN

${costBreakdown}

Total Campaign Investment: $${totalAmount.toLocaleString()}

📦 SERVICE DESCRIPTIONS

${serviceDescriptions}

⚠️ DISCLAIMER

Artist Influence, LLC makes every attempt to ensure the accuracy and reliability of services offered in this document. The information is provided "as is" without warranty. Services are subject to availability and adjustment based on market conditions.

Please do not share this document externally unless you are legally bound in the assistance and wellbeing of ${clientDetails.artistName} or the "${clientDetails.songTitle}" campaign.

Ready to proceed? Contact your sales representative to finalize this campaign.

Artist Influence
https://artistinfluence.com`;
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

function getServiceDescriptions(campaignData: any): string {
  const descriptions = [];
  
  if (campaignData.spotifyPlaylisting?.enabled) {
    descriptions.push(`SPOTIFY PLAYLISTING: We run fully organic Spotify campaigns that place your music on third-party playlists curated for your genre, helping you reach real listeners—not bots—and trigger Spotify's algorithm. Our network includes genre-specific curators who manually review and place tracks based on quality and fit.`);
  }
  
  if (campaignData.soundcloudReposts?.enabled) {
    descriptions.push(`SOUNDCLOUD REPOSTS: We tap into an underground network of verified SoundCloud artists and labels to organically repost your track across genre-specific communities. This service builds credibility and exposure within your target music scene.`);
  }
  
  if (campaignData.youtubeAds?.enabled) {
    descriptions.push(`YOUTUBE ADVERTISING: Our YouTube ad campaigns turn music videos into highly optimized promotional assets using strategic international targeting and our proprietary view-to-engagement ratio engine. We focus on reaching viewers most likely to engage with your music and follow your channel.`);
  }
  
  if (campaignData.instagramSeeding?.enabled) {
    descriptions.push(`INSTAGRAM SEEDING: Instagram seeding places your music on genre-aligned fan pages where your target audience already hangs out. We work with established pages that have engaged followings in your specific music niche.`);
  }
  
  if (campaignData.metaTiktokAds?.enabled) {
    descriptions.push(`META & TIKTOK ADS: Our social media campaigns deliver targeted reach through optimized ad placements across Facebook, Instagram, and TikTok. We create engaging creative content that drives streams, follows, and algorithmic growth.`);
  }
  
  return descriptions.join('\n\n');
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