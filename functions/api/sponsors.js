export async function onRequestGet(context) {
  const { request, env } = context;
  
  let fallbackData = { pageId: "V7V51RS95R", leaderboard: [], recent: [] };
  
  // 1. Fetch the static fallback seed data from local donation.json
  try {
    const localUrl = new URL('/donation.json', request.url);
    const fallbackRes = await fetch(localUrl);
    if (fallbackRes.ok) {
      fallbackData = await fallbackRes.json();
    }
  } catch (e) {
    console.error("Failed to fetch static fallback data:", e);
  }
  
  // 2. Fetch the live leaderboard from the ko-fi.tools API
  let leaderboard = fallbackData.leaderboard || [];
  try {
    const lbRes = await fetch('https://api.ko-fi.tools/leaderboard?pageid=V7V51RS95R');
    if (lbRes.ok) {
      const lbData = await lbRes.json();
      if (lbData && Array.isArray(lbData.supporters) && lbData.supporters.length > 0) {
        leaderboard = lbData.supporters.map(s => ({
          name: s.name || 'Anonymous',
          link: s.link || 'https://ko-fi.com/vividhpashokan'
        }));
      }
    }
  } catch (e) {
    console.error("Failed to fetch live leaderboard from Ko-fi.tools API:", e);
  }
  
  // 3. Fetch any dynamic webhook donations stored in Cloudflare KV
  let webhookRecent = [];
  if (env.DONATIONS_KV) {
    try {
      const stored = await env.DONATIONS_KV.get('recent_donations');
      if (stored) {
        webhookRecent = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to retrieve webhook donations from KV:", e);
    }
  }
  
  // 4. Merge new webhook donations (front) with static fallback seed donations (back)
  const mergedRecent = [...webhookRecent, ...(fallbackData.recent || [])];
  
  return new Response(JSON.stringify({
    pageId: fallbackData.pageId || "V7V51RS95R",
    leaderboard,
    recent: mergedRecent
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60' // Cache client side for 60 seconds
    }
  });
}
