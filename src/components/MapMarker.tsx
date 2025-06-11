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
  let markerColor = '#397eb2'; // Cor padrão e para todos os status

  // O código if/else if anterior para status pode ser removido ou comentado
  // if (status === 'Aprovada') {
  //   markerColor = '#397eb2';
  // } else if (status === 'Análise') {
  //   markerColor = '#397eb2';
  // } else if (status === 'Consulta') {
  //   markerColor = '#397eb2';
  // }

  // Create custom marker element
  const el = document.createElement('img') as HTMLImageElement;
  // el.src will be set dynamically after fetching and modifying the SVG
  el.className = 'marker';
  el.style.width = '60px';
  el.style.height = '84px';
  el.style.cursor = 'pointer';

  try {
    const response = await fetch('/icons/marker.svg');
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    }
    const svgText = await response.text();
    let modifiedSvgText = svgText.replace('fill="#FF0000"', `fill="${markerColor}"`);

    // Modify SVG circle radius
    modifiedSvgText = modifiedSvgText.replace('r="15"', 'r="18"');

    // Add construction ID to the SVG marker
    const idText = construction.id ? String(construction.id).substring(0, 6) : '';
    const textElement = `<text x="30" y="15" text-anchor="middle" fill="#FFFFFF" font-size="8px" font-family="Arial" font-weight="bold">${idText}</text>`;

    // Insert the text element before the closing </svg> tag
    const closingSvgTagIndex = modifiedSvgText.lastIndexOf('</svg>');
    if (closingSvgTagIndex !== -1) {
      modifiedSvgText = modifiedSvgText.substring(0, closingSvgTagIndex) + textElement + modifiedSvgText.substring(closingSvgTagIndex);
    }

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
