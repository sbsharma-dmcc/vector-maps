
// Amplitude event tracking utility
declare global {
  interface Window {
    amplitude: any;
  }
}

export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.amplitude) {
    console.log(`Tracking event: ${eventName}`, eventProperties);
    window.amplitude.track(eventName, eventProperties);
  } else {
    console.warn('Amplitude not initialized');
  }
};

export const trackLayerAdded = (layerType: string, layerId: string) => {
  trackEvent('Weather Layer Added', {
    layer_type: layerType,
    layer_id: layerId,
    timestamp: new Date().toISOString()
  });
};

export const trackLayerRemoved = (layerType: string, layerId: string) => {
  trackEvent('Weather Layer Removed', {
    layer_type: layerType,
    layer_id: layerId,
    timestamp: new Date().toISOString()
  });
};

export const trackLayerConfigurationApplied = (layerType: string, configDetails: any) => {
  trackEvent('Layer Configuration Applied', {
    layer_type: layerType,
    config_details: configDetails,
    timestamp: new Date().toISOString()
  });
};
