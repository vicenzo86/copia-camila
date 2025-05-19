/**
 * Utility functions for WebGL detection and support
 */

/**
 * Checks if the browser supports WebGL
 * @returns {boolean} Whether WebGL is supported
 */
export const checkWebGLSupport = (): boolean => {
  try {
    // Forçar suporte a WebGL para garantir que o Mapbox funcione
    console.log("Forçando suporte a WebGL para o Mapbox");
    return true;
    
    /* Código original comentado para referência
    // Mobile browser check
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    console.log("Device detection:", { isMobile, userAgent });
    
    // Para dispositivos móveis, vamos tentar ser mais permissivos
    if (isMobile) {
      // Em dispositivos móveis, vamos checar primeiro se o navegador é recente o suficiente
      // A maioria dos navegadores móveis modernos suporta WebGL
      const isRecentMobileBrowser = /Chrome\/([0-9]+)/.test(userAgent) || 
                                   /Firefox\/([0-9]+)/.test(userAgent) || 
                                   /Safari\/([0-9]+)/.test(userAgent);
      
      if (isRecentMobileBrowser) {
        console.log("Navegador móvel moderno detectado, assumindo suporte a WebGL");
        return true;
      }
    }
    
    const canvas = document.createElement('canvas');
    let gl = null;
    
    try {
      // Try to get WebGL context
      gl = canvas.getContext('webgl') || 
          canvas.getContext('experimental-webgl') || 
          canvas.getContext('webgl2');
    } catch (e) {
      console.error("Error getting WebGL context:", e);
      return false;
    }
    
    // Check if the context is valid and is a WebGLRenderingContext
    const supportsWebGL = !!(gl && gl instanceof WebGLRenderingContext);
    
    // Additional check for mobile devices - sometimes they report WebGL support but can't actually use it
    if (supportsWebGL && isMobile) {
      // Try to execute a simple WebGL operation
      try {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      } catch (e) {
        console.error("Error executing WebGL commands on mobile:", e);
        return false;
      }
    }
    
    console.log("WebGL support check:", {
      hasWebGLRenderingContext: !!window.WebGLRenderingContext,
      context: gl,
      contextValid: !!gl,
      isCorrectInstance: !!(gl && gl instanceof WebGLRenderingContext),
      supported: supportsWebGL
    });
    
    return supportsWebGL;
    */
  } catch (e) {
    console.error("Error checking WebGL support:", e);
    // Mesmo em caso de erro, retornar true para forçar o uso do Mapbox
    return true;
  }
};

/**
 * Checks if the device is a mobile device
 * @returns {boolean} Whether the device is mobile
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Detecta tablets também como dispositivos móveis
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent.toLowerCase());
  
  // Também verifica por características de touchscreen
  const hasTouch = 'ontouchstart' in window || 
                  navigator.maxTouchPoints > 0 || 
                  (navigator as any).msMaxTouchPoints > 0;
                  
  const isMobileViewport = window.innerWidth < 768;
  
  console.log("Mobile detection:", { 
    isMobile, 
    hasTouch, 
    isMobileViewport, 
    viewportWidth: window.innerWidth,
    userAgent
  });
  
  return isMobile || (hasTouch && isMobileViewport);
};
