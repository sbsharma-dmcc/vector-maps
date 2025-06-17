export const dtnOverlays = {
  wind: { dtnLayerId: 'fcst-manta-wind-speed-contours', tileSetId: 'b864ff86-22af-41fc-963e-38837d457566' },
  pressure: { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8' },
  swell: { dtnLayerId: 'fcst-manta-significant-wave-height-contours', tileSetId: 'fcst-manta-significant-wave-height-contours' },
  symbol: { dtnLayerId: 'fcst-manta-wind-symbol-grid', tileSetId: 'dd44281e-db07-41a1-a329-bedc225bb575' },
};

export const fetchDTNSourceLayer = async (layerId: string, token: string) => {
  try {
    console.log(`Fetching DTN source layer for: ${layerId}`);
    const response = await fetch(`https://map.api.dtn.com/v2/styles/${layerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch source layer for ${layerId}:`, response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log(`Source layer data for ${layerId}:`, data);
    const sourceLayerName = data[0]?.mapBoxStyle?.layers?.[0]?.["source-layer"];
    console.log(`Source layer name for ${layerId}:`, sourceLayerName);
    return sourceLayerName;
  } catch (error) {
    console.error(`Error fetching source layer for ${layerId}:`, error);
    return null;
  }
};

export const createSwellColorExpression = (config: any) => {
  const colorExpression: any[] = [
    'interpolate',
    ['exponential', 1.5],
    ['to-number', ['get', 'value'], 0]
  ];

  config.gradient.forEach((item: any) => {
    const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
    colorExpression.push(heightValue, item.color);
  });

  return colorExpression;
};

export const createMeteorologicalWindBarb = (speed: number, direction: number, unit: string = 'knots') => {
  // Convert speed to knots if needed
  let speedKnots = speed;
  if (unit === 'ms') speedKnots = speed * 1.944;
  if (unit === 'kmh') speedKnots = speed * 0.54;

  // Calm conditions (0-2 knots) - Circle
  if (speedKnots < 3) {
    return {
      symbol: '○',
      rotation: 0
    };
  }

  // Light air (3-7 knots) - Staff only
  if (speedKnots < 8) {
    return {
      symbol: '│',
      rotation: direction
    };
  }

  let barb = '';
  let remainingSpeed = Math.round(speedKnots);
  
  // Build barb from left to right based on meteorological standards
  // Add pennants for every 50 knots (triangular flags)
  const pennants = Math.floor(remainingSpeed / 50);
  for (let i = 0; i < pennants; i++) {
    barb += '◤';
  }
  remainingSpeed = remainingSpeed % 50;
  
  // Add full barbs for every 10 knots
  const fullBarbs = Math.floor(remainingSpeed / 10);
  for (let i = 0; i < fullBarbs; i++) {
    barb += '━';
  }
  remainingSpeed = remainingSpeed % 10;
  
  // Add half barb for 5-9 knots remainder
  if (remainingSpeed >= 5) {
    barb += '╸';
  }
  
  // Add the staff
  barb += '│';
  
  return {
    symbol: barb,
    rotation: direction
  };
};
