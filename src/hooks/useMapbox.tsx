import { useEffect, useRef, useState } from "react";
import { Construction } from "@/types/construction";
import { toast } from "@/components/ui/use-toast";
import { createMapMarker } from "@/components/MapMarker";
import { isMobileDevice } from "@/utils/webGLDetection";

declare global {
  interface Window {
    mapboxgl: any;
  }
}

// Token público do Mapbox (substitua pelo token público correto)
const DEFAULT_MAPBOX_TOKEN = "pk.eyJ1IjoidmljZW56bzE5ODYiLCJhIjoiY21hOTJ1dDk3MW43ajJwcHdtancwbG9zbSJ9.TTMx21fG8mpx04i1h2hl-Q";

interface UseMapboxProps {
  constructions: Construction[];
  onMarkerClick?: (construction: Construction) => void;
  center?: [number, number];
  zoom?: number;
}

export const useMapbox = ({
  constructions,
  onMarkerClick,
  center = [-49.6401, -27.2423],
  zoom = 9,
}: UseMapboxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const markers = useRef<any[]>([]);
  const [mapboxToken] = useState<string>(DEFAULT_MAPBOX_TOKEN);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapboxSupported, setMapboxSupported] = useState(true); // Sempre assume suporte
  const [mapboxScriptLoaded, setMapboxScriptLoaded] = useState(false);
  const [checkedSupport, setCheckedSupport] = useState(false);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const maxRenderAttempts = 3; // Aumentado para mais tentativas

  // Effect to check for Mapbox GL script
  useEffect(() => {
    let scriptCheckInterval: NodeJS.Timeout;

    const verifyMapboxScript = () => {
      if (typeof window !== "undefined" && window.mapboxgl) {
        console.log("Mapbox GL script loaded.");
        setMapboxScriptLoaded(true);
        if (scriptCheckInterval) clearInterval(scriptCheckInterval);

        // Sempre definir como suportado, ignorando a verificação de WebGL
        setMapboxSupported(true);
        setCheckedSupport(true);
      } else {
        console.log("Mapbox GL script not yet loaded, checking again...");
      }
    };

    // Initial check
    verifyMapboxScript();

    // Fallback interval check if not immediately available
    if (typeof window !== "undefined" && !window.mapboxgl) {
      scriptCheckInterval = setInterval(verifyMapboxScript, 500);
    }

    return () => {
      if (scriptCheckInterval) clearInterval(scriptCheckInterval);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapboxScriptLoaded || !mapContainer.current || !mapboxToken || !checkedSupport || renderAttempts >= maxRenderAttempts) {
      console.log("Map initialization skipped:", {
        mapboxScriptLoaded,
        hasContainer: !!mapContainer.current,
        hasToken: !!mapboxToken,
        checkedSupport,
        mapboxSupported,
        renderAttempts,
      });
      return;
    }

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      console.log("Initializing Mapbox with token:", mapboxToken);
      window.mapboxgl.accessToken = mapboxToken;
      // Definir workerCount para 2 para melhor desempenho
      window.mapboxgl.workerCount = 2;

      // Usar estilo mais leve para melhor compatibilidade
      const mapStyle = "mapbox://styles/mapbox/light-v11";

      const newMap = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: center,
        zoom: zoom,
        attributionControl: true,
        preserveDrawingBuffer: true,
        antialias: false, // Desativar antialiasing para melhor desempenho
        fadeDuration: 0,
        maxZoom: 19,
        minZoom: 3,
        pitch: 0,
        renderWorldCopies: true,
        maxParallelImageRequests: 4,
        transformRequest: (url: string, resourceType: string) => {
          // Adicionar cabeçalhos CORS para evitar problemas de acesso
          return {
            url: url,
            headers: {
              'Authorization': `Bearer ${mapboxToken}`,
              'Content-Type': 'application/json'
            }
          };
        }
      });

      newMap.addControl(
        new window.mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      newMap.on("load", () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        setMapError(null);
        toast({
          title: "Mapa carregado",
          description: "O mapa foi carregado com sucesso!",
        });
      });

      newMap.on("error", (e: any) => {
        console.error("Mapbox error details:", e);
        
        // Tentar novamente com outro estilo de mapa se falhar
        if (renderAttempts < maxRenderAttempts - 1) {
          console.log(`Retry attempt ${renderAttempts + 1} of ${maxRenderAttempts}`);
          setRenderAttempts((prev) => prev + 1);
          return;
        }
        
        // Após todas as tentativas, mostrar erro
        setMapError("Erro ao carregar o mapa. Usando visualização alternativa.");
        toast({
          title: "Erro ao carregar o mapa",
          description:
            "Não foi possível carregar o mapa. Usando visualização alternativa.",
          variant: "destructive",
        });
      });

      map.current = newMap;
    } catch (error) {
      console.error("Error initializing Mapbox map:", error);
      setMapError("Erro ao inicializar o mapa. Usando visualização alternativa.");
      
      if (error instanceof Error) {
        console.error("Mapbox initialization error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
      
      // Tentar novamente se ainda houver tentativas disponíveis
      if (renderAttempts < maxRenderAttempts - 1) {
        console.log(`Retry attempt ${renderAttempts + 1} of ${maxRenderAttempts} after error`);
        setRenderAttempts((prev) => prev + 1);
      }
    }

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxScriptLoaded, mapboxToken, center, zoom, checkedSupport, renderAttempts]);

  // Add markers to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !mapboxToken || !mapboxScriptLoaded) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    constructions.forEach((construction) => {
      try {
        if (!construction.latitude || !construction.longitude) return;
        const marker = createMapMarker({
          map: map.current!,
          construction,
          onMarkerClick,
          mapboxgl: window.mapboxgl,
        });
        markers.current.push(marker);
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });
  }, [constructions, mapboxToken, onMarkerClick, mapLoaded, mapboxScriptLoaded]);

  return {
    mapContainer,
    mapboxSupported,
    mapError,
    mapLoaded,
  };
};
