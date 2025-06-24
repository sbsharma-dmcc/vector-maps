
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

// Updated fallback token with marine weather permissions
const fallbackToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vd2VhdGhlci5hcGkuZHRuLmNvbS9jb25kaXRpb25zL21hcmluZSIsImlhdCI6MTc1MDY4OTAwMCwiZXhwIjoxNzUwNzc1NDAwLCJzY29wZSI6InJlYWQ6bWFyaW5lLXdlYXRoZXIiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6bWFyaW5lLXdlYXRoZXIiXX0.ThlH6i6zwLu-x9lCtC3rZ_y0i3093-bl0UebSLO09q8ufG2VJTpx1bjRnR8Cqeg3Hdi9HdaZlOxChBKHkCI2DeDPck79257fJ5w4hmOpmGNDtTR7vVrQafHCtPhZzTc00LeXPo4XJCC642nCVhAbBX5QzmH6jsDlwtl9Ek6C1XBcCVMg51ptBu6lamYRiMuXqtNmw7nDH7z6u9N9y-vJYPZAT-TMO_A37nCo0ZY2j-tJc2UFD5e4Usi90KFU7Xhpu60IRQK8CJAUyCcKVEYbzGiBvnUYybDNxPryAoFZAhL1rZycYhEujQ7SFkVokPCfLPJjbNcRl8i51UuEqxAaWg";

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
