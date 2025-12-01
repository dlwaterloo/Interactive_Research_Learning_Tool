// API Helper for Gemini
// API keys are loaded from .env file (see .env.example for template)
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const serpApiKey = import.meta.env.VITE_SERPAPI_KEY;

// Validate API keys are present
if (!geminiApiKey) {
  console.warn("VITE_GEMINI_API_KEY is not set. AI features may not work.");
}
if (!serpApiKey) {
  console.warn("VITE_SERPAPI_KEY is not set. Paper search may not work.");
}

export const generateGeminiResponse = async (prompt) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  
  for (let i = 0; i <= 5; i++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response at this time.";
    } catch (error) {
      if (i === 5) {
        console.error("Gemini API Error after retries:", error);
        return "Error connecting to AI service. Please try again.";
      }
      // Wait for the delay before retrying
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

// SerpAPI Helper for Google Scholar searches
// Uses Vite proxy to avoid CORS issues
export const searchGoogleScholar = async (query) => {
  if (!serpApiKey) {
    throw new Error("SerpAPI key is not configured. Please set VITE_SERPAPI_KEY in your .env file.");
  }

  try {
    // Use proxy in development, direct URL in production (if CORS allows)
    const isDev = import.meta.env.DEV;
    const apiUrl = isDev 
      ? `/api/serpapi/search.json?engine=google_scholar&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`
      : `https://serpapi.com/search.json?engine=google_scholar&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;
    
    console.log("Fetching from SerpAPI:", query);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("SerpAPI Response Error:", response.status, errorText);
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    
    // Check for SerpAPI error response
    if (data.error) {
      console.error("SerpAPI API Error:", data.error);
      throw new Error(data.error || "SerpAPI returned an error");
    }
    
    return data;
  } catch (error) {
    console.error("SerpAPI Error:", error);
    // Provide more helpful error message
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      throw new Error("CORS error: SerpAPI requests must go through a proxy. Please ensure the Vite dev server is running with proxy configuration.");
    }
    throw error;
  }
};

