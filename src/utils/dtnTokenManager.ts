
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
    console.log('Successfully fetched new DTN token');
    
    return `Bearer ${data.access_token}`;
  } catch (error) {
    console.error('Error fetching DTN token:', error);
    throw error;
  }
};

export const refreshDTNToken = async (): Promise<void> => {
  try {
    const newToken = await fetchNewDTNToken();
    
    // Store the new token in localStorage for persistence
    localStorage.setItem('dtnToken', newToken);
    localStorage.setItem('dtnTokenTimestamp', Date.now().toString());
    
    console.log('DTN token refreshed and stored');
  } catch (error) {
    console.error('Failed to refresh DTN token:', error);
    throw error;
  }
};

export const getDTNToken = (): string => {
  // First check if we have a stored token
  const storedToken = localStorage.getItem('dtnToken');
  const storedTimestamp = localStorage.getItem('dtnTokenTimestamp');
  
  // Check if token is less than 23 hours old (tokens expire in 24 hours)
  if (storedToken && storedTimestamp) {
    const tokenAge = Date.now() - parseInt(storedTimestamp);
    const hoursOld = tokenAge / (1000 * 60 * 60);
    
    if (hoursOld < 23) {
      console.log('Using stored DTN token');
      return storedToken;
    }
  }
  
  // If no valid stored token, return the hardcoded one as fallback
  // This will trigger a refresh on next use
  console.log('Using fallback DTN token');
  return "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUwMDU4MTY4LCJleHAiOjE3NTAxNDQ1NjgsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.LCsNRdOsCj7ilbkCnaOOLcEWRbSTjN48TszJ8JQ-3qZc6-GvR7e8mVNun6dhnbQef_coPT-f-55-1SyAqHn7CWdx2kCw-Q-DFNPCdfRTusMuvGjqu-vn7UxoRfxASevMkDF_dE7GhZlYn53k5rfW386G1SzOsk1ev9KUqRXomCLMlwOModPksZD82r65wn8RLpUltCkZliSvTLzPgf4HlE_EmQpO9LJrGPVlxxhMJpmzGIQpP-lQfPWQSsgtV3f0peYZhtnorWSbrn9RsApjO9qi3Gcu_c6FtFuzIsAkG_bpG-nJRyZP9vPwlpLVxI62voYLFPPdm3xgrxTvhUVSlg";
};
