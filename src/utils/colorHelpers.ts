
export const convertRgbToHex = (rgbString: string): string => {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgbString;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const convertHexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgb(${r}, ${g}, ${b})`;
};

export const getSymbolByType = (symbolType: string, customSymbol?: string): string => {
  switch (symbolType) {
    case 'arrow':
      return '→';
    case 'triangle':
      return '▲';
    case 'circle':
      return '●';
    case 'square':
      return '■';
    case 'custom':
      return customSymbol || '→';
    default:
      return '→';
  }
};
