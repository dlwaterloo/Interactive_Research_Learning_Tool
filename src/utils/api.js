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
  if (!geminiApiKey) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Check for API errors in response
      if (data.error) {
        throw new Error(data.error.message || "Gemini API returned an error");
      }
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("No response text from Gemini API");
      }
      
      return text;
    } catch (error) {
      if (i === 5) {
        console.error("Gemini API Error after retries:", error);
        throw error; // Re-throw to let caller handle it
      }
      // Wait for the delay before retrying
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

// SerpAPI Helper for Google Scholar searches
// Uses serverless function in production, Vite proxy in development
export const searchGoogleScholar = async (query) => {
  try {
    // Use serverless function API route (works in both dev and production)
    const apiUrl = `/api/serpapi?q=${encodeURIComponent(query)}`;
    
    console.log("Fetching from SerpAPI:", query);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error("SerpAPI Response Error:", response.status, errorData);
      throw new Error(errorData.error || `HTTP Error: ${response.status} ${response.statusText}`);
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
    throw error;
  }
};

