
const DTN_AUTH_URL = 'https://api.auth.dtn.com/v1/tokens/authorize';

const DTN_CREDENTIALS = {
  grant_type: 'client_credentials',
  client_id: 'FzFlvIj3cPPaz8espyrHD7ArJuecLNGP',
  client_secret: 'gri4NendKvwF3VH1qWUv9YiyiSQGC8xXvS32chLiavMSxq_i0eVr0bAPOwRZPayN',
  audience: 'https://map.api.dtn.com'
};

export interface DTNTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let tokenCache: string | null = null;
let tokenPromise: Promise<string> | null = null;

export const fetchNewDTNToken = async (): Promise<string> => {
  try {
    console.log('Fetching new DTN token...');
    
    const response = await fetch(DTN_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(DTN_CREDENTIALS),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch DTN token: ${response.status} ${response.statusText}`);
    }

    const data: DTNTokenResponse = await response.json();
    const newToken = `Bearer ${data.access_token}`;
    
    // Cache the token
    tokenCache = newToken;
    localStorage.setItem('dtnToken', newToken);
    localStorage.setItem('dtnTokenTimestamp', Date.now().toString());
    
    console.log('Successfully fetched and cached new DTN token');
    return newToken;
  } catch (error) {
    console.error('Error fetching DTN token:', error);
    throw error;
  }
};

// Check if a token is expired by decoding the JWT
const isTokenExpired = (token: string): boolean => {
  try {
    const bearerToken = token.replace('Bearer ', '');
    const payload = JSON.parse(atob(bearerToken.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token expires within the next 5 minutes (300 seconds)
    return payload.exp <= (currentTime + 300);
  } catch (error) {
    console.warn('Failed to parse token:', error);
    return true; // Assume expired if we can't parse it
  }
};

export const getValidDTNToken = async (): Promise<string> => {
  // If we already have a pending token request, wait for it
  if (tokenPromise) {
    try {
      return await tokenPromise;
    } catch (error) {
      tokenPromise = null; // Clear failed promise
    }
  }

  // Check cached token first
  if (tokenCache && !isTokenExpired(tokenCache)) {
    console.log('Using cached DTN token');
    return tokenCache;
  }

  // Check localStorage token
  const storedToken = localStorage.getItem('dtnToken');
  const storedTimestamp = localStorage.getItem('dtnTokenTimestamp');
  
  if (storedToken && storedTimestamp) {
    const tokenAge = Date.now() - parseInt(storedTimestamp);
    const hoursOld = tokenAge / (1000 * 60 * 60);
    
    if (hoursOld < 23 && !isTokenExpired(storedToken)) {
      console.log('Using valid stored DTN token');
      tokenCache = storedToken;
      return storedToken;
    } else {
      console.log('Stored token is expired, clearing storage');
      localStorage.removeItem('dtnToken');
      localStorage.removeItem('dtnTokenTimestamp');
    }
  }

  // Need to fetch new token
  console.log('Fetching new DTN token...');
  tokenPromise = fetchNewDTNToken();
  
  try {
    const newToken = await tokenPromise;
    tokenPromise = null; // Clear promise
    return newToken;
  } catch (error) {
    tokenPromise = null; // Clear failed promise
    console.error('Failed to fetch new token:', error);
    
    // Fallback to hardcoded token
    const fallbackToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUwMTQ0NzAzLCJleHAiOjE3NTAyMzExMDMsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.FCJ6gLJLJy-NtF75wXIv_1KLzwXKYrO5j577On2sS9x-FqZvpk5SphlyAm3gATn6Wn7osf2zj-nF75WudiVgAV_jqSbWEDBtI16k4ZcrMHz2jkjjkrCX4RjUMS-7oqqVUoPdOuWE-KRP4wZRH4VHv-aa24qs-J73YfZG-lYOAKS3nTBp6_mjbFG0Nj37vOprHfw2h0Glrw75sM2TlgmjFv8lx_oznHuq3t8opbqWHBq32L8PpOgxTx0xaqOiTuBUV75G3Nbt-EhHlz_fDypId1VfvVuPXlTAs1syPtm9va6GddF7cMoWA6u376XIBbYy9oa6b1PYPiN1osyBCTt60w";
    tokenCache = fallbackToken;
    return fallbackToken;
  }
};

// Clear token cache (useful for forcing refresh)
export const clearTokenCache = () => {
  tokenCache = null;
  tokenPromise = null;
  localStorage.removeItem('dtnToken');
  localStorage.removeItem('dtnTokenTimestamp');
};

// Sync method for backward compatibility
export const getDTNToken = (): string => {
  if (tokenCache) {
    return tokenCache;
  }
  
  const storedToken = localStorage.getItem('dtnToken');
  if (storedToken) {
    tokenCache = storedToken;
    return storedToken;
  }
  
  // Return fallback token
  const fallbackToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUwMTQ0NzAzLCJleHAiOjE3NTAyMzExMDMsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.FCJ6gLJLJy-NtF75wXIv_1KLzwXKYrO5j577On2sS9x-FqZvpk5SphlyAm3gATn6Wn7osf2zj-nF75WudiVgAV_jqSbWEDBtI16k4ZcrMHz2jkjjkrCX4RjUMS-7oqqVUoPdOuWE-KRP4wZRH4VHv-aa24qs-J73YfZG-lYOAKS3nTBp6_mjbFG0Nj37vOprHfw2h0Glrw75sM2TlgmjFv8lx_oznHuq3t8opbqWHBq32L8PpOgxTx0xaqOiTuBUV75G3Nbt-EhHlz_fDypId1VfvVuPXlTAs1syPtm9va6GddF7cMoWA6u376XIBbYy9oa6b1PYPiN1osyBCTt60w";
  tokenCache = fallbackToken;
  return fallbackToken;
};
