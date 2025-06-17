
// Simple direct token management without automatic refresh
let directToken: string | null = null;

export const setDirectDTNToken = (token: string): void => {
  directToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  console.log('Direct DTN token set');
};

export const getDirectDTNToken = (): string | null => {
  return directToken;
};

export const clearDirectDTNToken = (): void => {
  directToken = null;
  console.log('Direct DTN token cleared');
};

// Fallback token for backward compatibility
const fallbackToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUwMTQ0NzAzLCJleHAiOjE3NTAyMzExMDMsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.FCJ6gLJLJy-NtF75wXIv_1KLzwXKYrO5j577On2sS9x-FqZvpk5SphlyAm3gATn6Wn7osf2zj-nF75WudiVgAV_jqSbWEDBtI16k4ZcrMHz2jkjjkrCX4RjUMS-7oqqVUoPdOuWE-KRP4wZRH4VHv-aa24qs-J73YfZG-lYOAKS3nTBp6_mjbFG0Nj37vOprHfw2h0Glrw75sM2TlgmjFv8lx_oznHuq3t8opbqWHBq32L8PpOgxTx0xaqOiTuBUV75G3Nbt-EhHlz_fDypId1VfvVuPXlTAs1syPtm9va6GddF7cMoWA6u376XIBbYy9oa6b1PYPiN1osyBCTt60w";

// Simple sync method that returns direct token or fallback
export const getDTNToken = (): string => {
  if (directToken) {
    console.log('Using direct DTN token');
    return directToken;
  }
  
  console.log('Using fallback DTN token');
  return fallbackToken;
};

// Legacy compatibility function - now just returns the direct token or fallback
export const getValidDTNToken = async (): Promise<string> => {
  return getDTNToken();
};
