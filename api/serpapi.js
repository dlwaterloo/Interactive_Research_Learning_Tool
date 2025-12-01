// Vercel Serverless Function for SerpAPI proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q: query, ...otherParams } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Get API key from environment (Vercel will set this)
  const apiKey = process.env.VITE_SERPAPI_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'SerpAPI key is not configured. Please set VITE_SERPAPI_KEY environment variable.' });
  }

  try {
    // Build the SerpAPI URL
    const params = new URLSearchParams({
      engine: 'google_scholar',
      q: query,
      api_key: apiKey,
      ...otherParams
    });

    const serpApiUrl = `https://serpapi.com/search.json?${params.toString()}`;
    
    console.log('Proxying SerpAPI request:', query);
    const response = await fetch(serpApiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `SerpAPI request failed: ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    
    // Check for SerpAPI error in response
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    // Return the data
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch from SerpAPI',
      message: error.message 
    });
  }
}

