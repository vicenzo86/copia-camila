import { Construction } from '@/types/construction';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MarkerOptions {
  map: any;
  construction: Construction;
  onMarkerClick?: (construction: Construction) => void;
  mapboxgl: any;
}

/**
 * Creates a custom Mapbox marker for a construction
 * @param options Options for creating the marker
 * @returns The created Mapbox marker
 */
export const createMapMarker = async ({ map, construction, onMarkerClick, mapboxgl }: MarkerOptions): Promise<any> => {
  const { latitude, longitude, status } = construction;
  
  if (!latitude || !longitude) {
    throw new Error('Invalid coordinates for marker');
  }

  // Determinar a cor do marcador com base no status
  let markerColor = '#4285F4'; // Azul padrão
  
  if (status === 'Aprovada') {
    markerColor = '#10b981'; // Verde para aprovado
  } else if (status === 'Análise') {
    markerColor = '#4285F4'; // Azul para análise
  } else if (status === 'Consulta') {
    markerColor = '#4285F4'; // Azul para consulta
  }

  // Create custom marker element
  const el = document.createElement('img') as HTMLImageElement;
  // el.src will be set dynamically after fetching and modifying the SVG
  el.className = 'marker';
  el.style.width = '40px';
  el.style.height = '56px';
  el.style.cursor = 'pointer';

  try {
    const response = await fetch('/icons/marker-new.svg');
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    }
    const svgText = await response.text();
    const modifiedSvgText = svgText.replace('fill="#FF0000"', `fill="${markerColor}"`);
    el.src = "data:image/svg+xml;base64," + btoa(modifiedSvgText);

    // Criar o marcador APÓS o src da imagem ser definido
    const marker = new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .addTo(map);

    // Adicionar evento de clique
    el.addEventListener('click', () => {
      if (onMarkerClick) {
        onMarkerClick(construction);
      }
    });

    return marker;
  } catch (error) {
    console.error("Error creating dynamic marker:", error);
    // Fallback or error handling: Optionally create a default marker or return null
    // For now, re-throw to indicate failure or return a promise that rejects
    throw error; 
  }
};
