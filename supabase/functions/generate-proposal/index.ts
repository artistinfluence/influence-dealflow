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
    // Basic rate limiting and logging
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log(`Proposal request from IP: ${clientIP} at ${new Date().toISOString()}`);

    const requestBody = await req.json();
    
    // Input validation
    if (!requestBody || typeof requestBody !== 'object') {
      console.error('Invalid request body:', requestBody);
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { clientDetails, campaignData, recipientEmail } = requestBody;

    // Validate required fields
    if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
      console.error('Invalid email:', recipientEmail);
      return new Response(JSON.stringify({ error: 'Valid email address is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!clientDetails?.artistName || !clientDetails?.songTitle) {
      console.error('Missing client details:', clientDetails);
      return new Response(JSON.stringify({ error: 'Artist name and song title are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate that at least one service is enabled
    const hasActiveServices = Object.values(campaignData || {}).some(
      (service: any) => service?.enabled && ((service.price > 0) || (service.totalPrice > 0))
    );

    if (!hasActiveServices) {
      console.error('No active services found:', campaignData);
      return new Response(JSON.stringify({ error: 'At least one service must be enabled with valid pricing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize email
    const sanitizedEmail = recipientEmail.trim().toLowerCase();

    // Generate proposal content using OpenAI
    const proposalContent = await generateProposalContent(clientDetails, campaignData);
    
    // Send email via Resend
    const emailResponse = await sendProposalEmail(sanitizedEmail, clientDetails, proposalContent, campaignData);
    
    // Track proposal in database
    const totalAmount = calculateTotalAmount(campaignData);
    await supabase.from('proposals').insert({
      artist_name: clientDetails.artistName,
      song_title: clientDetails.songTitle,
      recipient_email: sanitizedEmail,
      total_amount: totalAmount,
      services_included: campaignData,
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Security: Never expose internal error details
    console.error('Error in generate-proposal function:', error);
    
    // Log detailed error internally but return generic message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Detailed error:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process proposal request. Please check your input and try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateProposalContent(clientDetails: any, campaignData: any) {
  const activeServices = getActiveServices(campaignData);
  
  const serviceDescriptions = {
    'Spotify Playlisting': 'We run fully organic Spotify campaigns that place your music on third-party playlists curated for your genre, helping you reach real listeners—not bots—and trigger Spotify\'s algorithm. Each campaign is designed for maximum discovery, often resulting in Discovery Weekly or Radio placements, with strong performance in both U.S. and global markets. Stream goals are guaranteed, and every campaign includes weekly reporting, performance tracking, and strategic playlist placement to boost saves, followers, and engagement.',
    'SoundCloud Reposts': 'We tap into an underground network of verified SoundCloud artists and labels to organically repost your track across genre-specific communities. With over 50 million active U.S.-based listeners reached through our repost groups, this service connects your music with passionate fans who actively seek new sounds. Campaigns are fully transparent, trackable, and optimized to foster genuine fan engagement rather than passive plays.',
    'YouTube Advertising': 'Our YouTube ad campaigns turn music videos into highly optimized promotional assets using strategic international targeting and our proprietary view-to-engagement ratio engine. By tapping into global markets with ultra-low CPVs, we maximize reach while ensuring your video resonates with viewers. Whether you\'re focused on subscribers, long-form engagement, or workarounds for unapproved videos, we tailor every campaign for high impact and transparent reporting.',
    'Instagram Seeding': 'Instagram seeding places your music on genre-aligned fan pages—like EDM edits or festival reels—where your target audience already hangs out. We handpick creators (not recycled influencers) for each campaign to ensure relevance and cost-efficiency, maximizing ROI and discovery. Every post tags the artist, links the sound, and is tracked via a live dashboard so you can see real-time results.',
    'Meta & TikTok Ads': 'Our Meta Video Ads service turns your mix highlights and vertical edits into thumb-stopping paid placements across Facebook and Instagram feeds, Stories, and Reels. We build layered interest, behavior, and look-alike audiences drawn from your past viewers and genre peers, then continually A/B test creatives, hooks, and copy to lock in the lowest possible CPVs in high-value territories. Campaigns include real-time budget pacing, exclusion of bot-heavy regions, and remarketing to warm fans—driving qualified traffic back to YouTube, Spotify, or your next drop. Weekly reporting provides full delivery metrics plus audience insights, so you always know where growth is coming from.',
    'TikTok Spark Ads': 'Our Spark Ads service turns native TikTok content—either your own or our recommended creatives—into powerful ads served directly in the For You feed. These campaigns deliver best-in-class CPVs (as low as $0.03), with precision targeting for playlisting, ticket sales, or streaming. We optimize your campaign daily by scaling top-performing creatives and provide clear weekly reporting and final data exports.'
  };
  
  const prompt = `Generate a professional campaign proposal following the exact structure below. Do NOT include any greeting, salutation, or introductory paragraph. Start directly with the campaign goals section.

Structure Requirements:

🎯 CAMPAIGN GOALS
[2–5 sentence paragraph personalized to artist context and release plan.]
- Bullet point goals based on each included service.

💰 COST BREAKDOWN
[List each service name, quantity/type, and price in consistent format.]
Total Investment: $[Sum]

📦 SERVICE DESCRIPTIONS
[Use ONLY the exact service descriptions provided below. Do NOT paraphrase, shorten, or summarize. Match original formatting exactly.]

📋 DISCLAIMER AND DOCUMENT USAGE

Artist Influence, LLC makes every attempt to be sure of the accuracy and reliability of services offered in this document. The information is, however, provided "as is" without a warranty of any kind.

Artist Influence, LLC shall not be held liable for any loss or damage of any nature (direct, indirect, consequential, or other) as a result of our services offered and performed. We do not guarantee any results unless stated and agreed upon by all parties involved.

This document is tailored to and to be restricted only to ${clientDetails.artistName} and those who are legally bound in the assistance and wellbeing of ${clientDetails.artistName} (i.e. agents, booking, press, etc.) — Please do not share this document with parties not currently legally involved with ${clientDetails.artistName}.

Artist Influence, LLC reserves the right to adjust pricing to meet the needs of the client or any factors otherwise.

Please respect our privacy and do not share any information provided within this document with any other parties.

Thank you.
— The Artist Influence Team

1. Maintain Internal Logic & Formatting:
2. Ensure all price formatting is consistent.
3. Do not adjust any service prices or goals — use them exactly as provided.
4. Include only the relevant service descriptions from those provided below.
5. Tone and Style:
6. Keep a professional but music-industry-savvy tone.
7. Emphasize value, targeting, momentum, and strategic rollout.
8. Avoid redundant phrasing or overt sales language.
9. Write the proposal ABOUT the artist in third person, not TO the artist. Do not use "your" or "you" - refer to the artist by name.
10. Proposal must be ready for direct copy-paste into an email or PDF.

Artist Information:
- Name: ${clientDetails.artistName}
- Genre: ${clientDetails.genre}
- Song/Release: ${clientDetails.songTitle}
- Campaign Start: ${clientDetails.campaignStart}
- Artist Tier: ${clientDetails.artistTier}

Selected Services and Pricing:
${activeServices.map(service => `- ${service.name}: ${service.details} — $${service.price}`).join('\n')}

Total Investment: $${calculateTotalAmount(campaignData)}

EXACT SERVICE DESCRIPTIONS TO USE:
${activeServices.map(service => {
  return `${service.name.toUpperCase()}\n${serviceDescriptions[service.name] || 'Service description not available'}`;
}).join('\n\n')}

Generate a professional campaign proposal following the exact structure above. Keep campaign goals to 1 bullet point per service maximum. Use ONLY the exact service descriptions provided above and do not modify pricing. CRITICAL: Use the complete disclaimer text exactly as provided - do not shorten, summarize, or modify it in any way.`;

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
          content: 'You are a professional music campaign proposal formatter. Follow the exact structure and formatting requirements provided in the prompt. Use ONLY the exact service descriptions provided in the prompt - do not create your own descriptions or modify them in any way.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
  const commissions = calculateCommissions(campaignData);
  const commissionTotal = Object.values(commissions).reduce((sum: number, amount: number) => sum + amount, 0);
  
  const commissionBreakdown = `
💰 SALESPERSON COMMISSION BREAKDOWN

YouTube Ads: $${commissions.youtubeAds}
Spotify Playlisting: $${commissions.spotifyPlaylisting}
SoundCloud Reposts: $${commissions.soundcloudReposts}
Instagram Seeding: $${commissions.instagramSeeding}
Meta & TikTok Ads: $${commissions.metaTiktokAds}

TOTAL COMMISSION: $${commissionTotal}`;

  return `📄 CAMPAIGN PROPOSAL

PREPARED BY: Artist Influence
FOR: ${clientDetails.artistName} – "${clientDetails.songTitle}"
VALID UNTIL: ${validUntil.toLocaleDateString('en-US')}

${aiContent}
${commissionBreakdown}

Artist Influence
https://artistinfluence.com`;
}

function getActiveServices(campaignData: any) {
  const services = [];
  
  if (campaignData.youtubeAds?.enabled && campaignData.youtubeAds.sections) {
    const activeSections = campaignData.youtubeAds.sections.filter((section: any) => section.platform && section.price > 0);
    if (activeSections.length > 0) {
      const totalPrice = activeSections.reduce((sum: number, section: any) => sum + section.price, 0);
      const sectionDetails = activeSections.map((section: any) => 
        `${section.platform} - ${section.targetViews.toLocaleString()} views`
      ).join(', ');
      services.push({
        name: 'YouTube Advertising',
        details: sectionDetails,
        price: totalPrice
      });
    }
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
    const budget = Math.round((campaignData.instagramSeeding.price || 0) * 0.7);
    services.push({
      name: 'Instagram Seeding',
      details: `$${budget} budget`,
      price: campaignData.instagramSeeding.price || 0
    });
  }
  
  if (campaignData.metaTiktokAds?.enabled) {
    const budget = Math.round((campaignData.metaTiktokAds.price || 0) * 0.7);
    services.push({
      name: 'Meta & TikTok Ads',
      details: `${campaignData.metaTiktokAds.platform} - $${budget} budget`,
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
    const price = campaignData.youtubeAds.totalPrice || 0;
    const discount = campaignData.youtubeAds.discount || 0;
    total += price * (1 - discount / 100);
  }
  if (campaignData.spotifyPlaylisting?.enabled) {
    const price = campaignData.spotifyPlaylisting.price || 0;
    const discount = campaignData.spotifyPlaylisting.discount || 0;
    total += price * (1 - discount / 100);
  }
  if (campaignData.soundcloudReposts?.enabled) {
    const price = campaignData.soundcloudReposts.price || 0;
    const discount = campaignData.soundcloudReposts.discount || 0;
    total += price * (1 - discount / 100);
  }
  if (campaignData.instagramSeeding?.enabled) {
    const price = campaignData.instagramSeeding.price || 0;
    const discount = campaignData.instagramSeeding.discount || 0;
    total += price * (1 - discount / 100);
  }
  if (campaignData.metaTiktokAds?.enabled) {
    const price = campaignData.metaTiktokAds.price || 0;
    const discount = campaignData.metaTiktokAds.discount || 0;
    total += price * (1 - discount / 100);
  }
  
  return total;
}

function calculateCommissions(campaignData: any) {
  const calculateGrossCommission = (price: number) => price * 0.2;
  const calculateNetCommission = (price: number) => price * 0.06; // 6% for Instagram and Meta/TikTok ads
  
  // Apply per-service discount to prices
  const applyServiceDiscount = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const commissions = {
    youtubeAds: 0,
    spotifyPlaylisting: 0,
    soundcloudReposts: 0,
    instagramSeeding: 0,
    metaTiktokAds: 0
  };

  if (campaignData.youtubeAds?.enabled) {
    commissions.youtubeAds = Math.round(calculateGrossCommission(applyServiceDiscount(campaignData.youtubeAds.totalPrice || 0, campaignData.youtubeAds.discount || 0)));
  }
  if (campaignData.spotifyPlaylisting?.enabled) {
    commissions.spotifyPlaylisting = Math.round(calculateGrossCommission(applyServiceDiscount(campaignData.spotifyPlaylisting.price || 0, campaignData.spotifyPlaylisting.discount || 0)));
  }
  if (campaignData.soundcloudReposts?.enabled) {
    commissions.soundcloudReposts = Math.round(calculateGrossCommission(applyServiceDiscount(campaignData.soundcloudReposts.price || 0, campaignData.soundcloudReposts.discount || 0)));
  }
  if (campaignData.instagramSeeding?.enabled) {
    commissions.instagramSeeding = Math.round(calculateNetCommission(applyServiceDiscount(campaignData.instagramSeeding.price || 0, campaignData.instagramSeeding.discount || 0)));
  }
  if (campaignData.metaTiktokAds?.enabled) {
    commissions.metaTiktokAds = Math.round(calculateNetCommission(applyServiceDiscount(campaignData.metaTiktokAds.price || 0, campaignData.metaTiktokAds.discount || 0)));
  }

  return commissions;
}