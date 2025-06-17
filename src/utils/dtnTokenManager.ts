
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

let currentToken: string | null = null;
let tokenExpiryTime: number | null = null;

export const fetchNewDTNToken = async (): Promise<string> => {
  try {
    console.log('🔄 Fetching new DTN authorization token...');
    console.log('Auth URL:', DTN_AUTH_URL);
    console.log('Client ID:', DTN_CREDENTIALS.client_id);
    
    const response = await fetch(DTN_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(DTN_CREDENTIALS),
    });

    console.log('Token response status:', response.status);
    console.log('Token response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', response.status, response.statusText, errorText);
      throw new Error(`Failed to fetch DTN token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: DTNTokenResponse = await response.json();
    console.log('✅ Successfully fetched new DTN token');
    console.log('Token type:', data.token_type);
    console.log('Expires in:', data.expires_in, 'seconds');
    
    // Store token and expiry time
    currentToken = `Bearer ${data.access_token}`;
    tokenExpiryTime = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety
    
    return currentToken;
  } catch (error) {
    console.error('❌ Error fetching DTN token:', error);
    throw error;
  }
};

export const refreshDTNToken = async (): Promise<void> => {
  try {
    console.log('🔄 Refreshing DTN token...');
    const newToken = await fetchNewDTNToken();
    
    // Store the new token in localStorage for persistence
    localStorage.setItem('dtnToken', newToken);
    localStorage.setItem('dtnTokenTimestamp', Date.now().toString());
    localStorage.setItem('dtnTokenExpiry', tokenExpiryTime?.toString() || '');
    
    console.log('✅ DTN token refreshed and stored');
  } catch (error) {
    console.error('❌ Failed to refresh DTN token:', error);
    throw error;
  }
};

export const isTokenExpired = (): boolean => {
  if (!tokenExpiryTime) {
    // Check localStorage for expiry time
    const storedExpiry = localStorage.getItem('dtnTokenExpiry');
    if (storedExpiry) {
      tokenExpiryTime = parseInt(storedExpiry);
    }
  }
  
  if (!tokenExpiryTime) return true;
  
  const isExpired = Date.now() > tokenExpiryTime;
  if (isExpired) {
    console.log('🕐 DTN token has expired');
  }
  return isExpired;
};

export const getDTNToken = async (): Promise<string> => {
  // Check if we have a current valid token
  if (currentToken && !isTokenExpired()) {
    console.log('✅ Using current valid DTN token');
    return currentToken;
  }
  
  // Check localStorage for a valid stored token
  const storedToken = localStorage.getItem('dtnToken');
  const storedTimestamp = localStorage.getItem('dtnTokenTimestamp');
  const storedExpiry = localStorage.getItem('dtnTokenExpiry');
  
  if (storedToken && storedExpiry) {
    const expiryTime = parseInt(storedExpiry);
    if (Date.now() < expiryTime) {
      console.log('✅ Using valid stored DTN token');
      currentToken = storedToken;
      tokenExpiryTime = expiryTime;
      return storedToken;
    } else {
      console.log('🕐 Stored DTN token has expired');
    }
  }
  
  // No valid token available, fetch a new one
  console.log('🔄 No valid token available, fetching new one...');
  try {
    const newToken = await fetchNewDTNToken();
    
    // Store the new token
    localStorage.setItem('dtnToken', newToken);
    localStorage.setItem('dtnTokenTimestamp', Date.now().toString());
    localStorage.setItem('dtnTokenExpiry', tokenExpiryTime?.toString() || '');
    
    return newToken;
  } catch (error) {
    console.error('❌ Failed to get DTN token, using fallback');
    // Return the hardcoded fallback token as last resort
    const fallbackToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUwMDU4MTY4LCJleHAiOjE3NTAxNDQ1NjgsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.LCsNRdOsCj7ilbkCnaOOLcEWRbSTjN48TszJ8JQ-3qZc6-GvR7e8mVNun6dhnbQef_coPT-f-55-1SyAqHn7CWdx2kCw-Q-DFNPCdfRTusMuvGjqu-vn7UxoRfxASevMkDF_dE7GhZlYn53k5rfW386G1SzOsk1ev9KUqRXomCLMlwOModPksZD82r65wn8RLpUltCkZliSvTLzPgf4HlE_EmQpO9LJrGPVlxxhMJpmzGIQpP-lQfPWQSsgtV3f0peYZhtnorWSbrn9RsApjO9qi3Gcu_c6FtFuzIsAkG_bpG-nJRyZP9vPwlpLVxI62voYLFPPdm3xgrxTvhUVSlg";
    return fallbackToken;
  }
};

// Function to validate if a token works with DTN API
export const validateDTNToken = async (token: string): Promise<boolean> => {
  try {
    console.log('🔍 Validating DTN token...');
    const cleanToken = token.replace('Bearer ', '');
    
    const response = await fetch('https://map.api.dtn.com/v2/styles/fcst-manta-wind-speed-contours', {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    const isValid = response.ok;
    console.log(`Token validation result: ${isValid ? '✅ Valid' : '❌ Invalid'} (Status: ${response.status})`);
    
    return isValid;
  } catch (error) {
    console.error('❌ Token validation error:', error);
    return false;
  }
};

// Function to ensure we have a valid token (fetch new one if current is invalid)
export const ensureValidDTNToken = async (): Promise<string> => {
  let token = await getDTNToken();
  
  // Validate the token
  const isValid = await validateDTNToken(token);
  
  if (!isValid) {
    console.log('🔄 Current token is invalid, fetching new one...');
    
    // Clear stored tokens
    localStorage.removeItem('dtnToken');
    localStorage.removeItem('dtnTokenTimestamp');
    localStorage.removeItem('dtnTokenExpiry');
    currentToken = null;
    tokenExpiryTime = null;
    
    // Fetch a fresh token
    token = await fetchNewDTNToken();
    
    // Store the new token
    localStorage.setItem('dtnToken', token);
    localStorage.setItem('dtnTokenTimestamp', Date.now().toString());
    localStorage.setItem('dtnTokenExpiry', tokenExpiryTime?.toString() || '');
  }
  
  return token;
};
