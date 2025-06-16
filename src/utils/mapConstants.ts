
import { getDTNToken } from './dtnTokenManager';

// DTN API token for weather layers - now dynamically managed
export const dtnToken = getDTNToken();

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
