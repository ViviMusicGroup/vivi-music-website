export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Ko-fi sends the data as a form parameter named 'data' containing a JSON string
    const formData = await request.formData();
    const dataStr = formData.get('data');
    
    if (!dataStr) {
      return new Response('Bad Request: Missing data parameter', { status: 400 });
    }
    
    const payload = JSON.parse(dataStr);
    
    // Validate verification token if defined in Cloudflare settings
    const secretToken = env.KOFI_VERIFICATION_TOKEN;
    if (secretToken && payload.verification_token !== secretToken) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // We only care about support events (Donation, Subscription, Shop Order)
    const type = payload.type || 'Donation';
    const isTest = payload.is_test === true;
    
    // Extract supporter details
    const name = payload.from_name || 'Supporter (Anonymous)';
    const message = payload.message || '';
    const amount = payload.amount || '0.00';
    const currency = payload.currency || 'USD';
    const timestamp = payload.timestamp || new Date().toISOString();
    
    // Format a relative or friendly date
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = new Date(timestamp).toLocaleDateString('en-US', dateOptions);
    
    const newDonation = {
      name,
      message,
      amount: `${amount} ${currency}`,
      date: formattedDate,
      timestamp,
      type,
      isTest
    };
    
    // Store in Cloudflare KV if bound
    if (env.DONATIONS_KV) {
      let donations = [];
      const stored = await env.DONATIONS_KV.get('recent_donations');
      if (stored) {
        try {
          donations = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse existing donations from KV', e);
        }
      }
      
      // Add the new donation to the front of the list
      donations.unshift(newDonation);
      
      // Cap the list at 100 entries
      if (donations.length > 100) {
        donations = donations.slice(0, 100);
      }
      
      await env.DONATIONS_KV.put('recent_donations', JSON.stringify(donations));
    }
    
    return new Response('Success', { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain' } 
    });
  } catch (error) {
    return new Response(`Server Error: ${error.message}`, { 
      status: 500, 
      headers: { 'Content-Type': 'text/plain' } 
    });
  }
}
