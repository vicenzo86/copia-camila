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
export const createMapMarker = ({ map, construction, onMarkerClick, mapboxgl }: MarkerOptions): any => {
  const { latitude, longitude, status } = construction;
  
  if (!latitude || !longitude) {
    throw new Error('Invalid coordinates for marker');
  }

  // Determinar a cor do marcador com base no status
  let markerColor = '#f59e0b'; // Amarelo/laranja padrão
  
  if (status === 'Aprovada') {
    markerColor = '#10b981'; // Verde para aprovado
  } else if (status === 'Análise') {
    markerColor = '#f59e0b'; // Amarelo para análise
  } else if (status === 'Consulta') {
    markerColor = '#3b82f6'; // Azul para consulta
  }

  // Create custom marker element
  const el = document.createElement('div');
  el.className = 'marker';
  el.style.width = '32px';
  el.style.height = '32px';
  el.style.borderRadius = '50%';
  el.style.background = markerColor;
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.color = 'white';
  el.style.fontWeight = 'bold';
  el.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  el.style.cursor = 'pointer';
  el.style.border = '2px solid white';
  
  // Criar o marcador
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
};
