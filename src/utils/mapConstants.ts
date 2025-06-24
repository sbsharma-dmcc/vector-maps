
import { getValidDTNToken } from './dtnTokenManager';

// DTN API token for weather layers - now dynamically managed
export const getDTNToken = async () => {
  return await getValidDTNToken();
};

// Layer configurations for DTN API
export const layerConfigs = {
  pressure: { dtnLayerId: 'pressure', tileSetId: 'pressure-latest' },
  storm: { dtnLayerId: 'storm', tileSetId: 'storm-latest' },
  current: { dtnLayerId: 'current', tileSetId: 'current-latest' },
  wind: { dtnLayerId: 'fcst-onefx-wind-speed-contours', tileSetId: '1fed7688-ee77-4c15-acfa-3e6d5d0fb2a9' }
};

// Base layer styles - always use the same default style
export const baseLayerStyles = {
  default: "mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66",
  swell: "mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66",
  wave: "mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66"
};

export const defaultMapToken = 'pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q';

// Updated DTN token with correct audience and permissions for marine weather
export const dtnToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vd2VhdGhlci5hcGkuZHRuLmNvbS9jb25kaXRpb25zL21hcmluZSIsImlhdCI6MTc1MDY4OTAwMCwiZXhwIjoxNzUwNzc1NDAwLCJzY29wZSI6InJlYWQ6bWFyaW5lLXdlYXRoZXIiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6bWFyaW5lLXdlYXRoZXIiXX0.ThlH6i6zwLu-x9lCtC3rZ_y0i3093-bl0UebSLO09q8ufG2VJTpx1bjRnR8Cqeg3Hdi9HdaZlOxChBKHkCI2DeDPck79257fJ5w4hmOpmGNDtTR7vVrQafHCtPhZzTc00LeXPo4XJCC642nCVhAbBX5QzmH6jsDlwtl9Ek6C1XBcCVMg51ptBu6lamYRiMuXqtNmw7nDH7z6u9N9y-vJYPZAT-TMO_A37nCo0ZY2j-tJc2UFD5e4Usi90KFU7Xhpu60IRQK8CJAUyCcKVEYbzGiBvnUYybDNxPryAoFZAhL1rZycYhEujQ7SFkVokPCfLPJjbNcRl8i51UuEqxAaWg";
