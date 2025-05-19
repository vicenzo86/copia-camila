import { useEffect, useRef, useState, useCallback } from "react";
import { Construction } from "@/types/construction";
import { toast } from "@/components/ui/use-toast";
import { createMapMarker } from "@/components/MapMarker";
import { isMobileDevice } from "@/utils/webGLDetection";

declare global {
  interface Window {
    mapboxgl: any;
  }
}

// Token público do Mapbox atualizado
const DEFAULT_MAPBOX_TOKEN = "pk.eyJ1IjoidmljZW56bzE5ODYiLCJhIjoiY21hdWxuODBxMHE3czJvbzlpajdhc3R0ciJ9.Stj-wArKkPC-b6YPWtE-nw";

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
  const [mapboxSupported, setMapboxSupported] = useState(true);
  const [mapboxScriptLoaded, setMapboxScriptLoaded] = useState(false);
  const initializationAttempted = useRef(false);

  // Verificar se o script do Mapbox está carregado
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let scriptCheckInterval: NodeJS.Timeout;
    
    const verifyMapboxScript = () => {
      if (window.mapboxgl) {
        console.log("Mapbox GL script loaded.");
        setMapboxScriptLoaded(true);
        if (scriptCheckInterval) clearInterval(scriptCheckInterval);
      } else {
        console.log("Mapbox GL script not yet loaded, checking again...");
      }
    };
    
    verifyMapboxScript();
    
    if (!window.mapboxgl) {
      scriptCheckInterval = setInterval(verifyMapboxScript, 500);
    }
    
    return () => {
      if (scriptCheckInterval) clearInterval(scriptCheckInterval);
    };
  }, []);

  // Inicializar o mapa - usando useCallback para evitar recriação da função
  const initializeMap = useCallback(() => {
    if (!mapContainer.current || !mapboxToken || !mapboxScriptLoaded || !window.mapboxgl) {
      return false;
    }

    try {
      console.log("Initializing Mapbox with token:", mapboxToken);
      window.mapboxgl.accessToken = mapboxToken;
      
      const newMap = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: center,
        zoom: zoom,
        attributionControl: true,
        preserveDrawingBuffer: true,
        antialias: false,
        fadeDuration: 0,
        maxZoom: 19,
        minZoom: 3,
        pitch: 0,
        renderWorldCopies: true,
        maxParallelImageRequests: 4
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
        setMapError("Erro ao carregar o mapa. Usando visualização alternativa.");
        toast({
          title: "Erro ao carregar o mapa",
          description: "Não foi possível carregar o mapa. Usando visualização alternativa.",
          variant: "destructive",
        });
      });

      map.current = newMap;
      return true;
    } catch (error) {
      console.error("Error initializing Mapbox map:", error);
      setMapError("Erro ao inicializar o mapa. Usando visualização alternativa.");
      
      if (error instanceof Error) {
        console.error("Mapbox initialization error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
      
      return false;
    }
  }, [mapboxToken, center, zoom, mapboxScriptLoaded]);

  // Efeito para inicializar o mapa apenas uma vez
  useEffect(() => {
    // Verificar se já tentamos inicializar antes para evitar loops
    if (initializationAttempted.current) return;
    
    // Marcar que tentamos inicializar
    initializationAttempted.current = true;
    
    if (mapboxScriptLoaded && mapContainer.current) {
      initializeMap();
    }
    
    return () => {
      if (map.current) {
        markers.current.forEach((marker) => marker.remove());
        markers.current = [];
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxScriptLoaded, initializeMap]);

  // Adicionar marcadores ao mapa
  useEffect(() => {
    if (!map.current || !mapLoaded || !constructions.length) return;

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
  }, [constructions, onMarkerClick, mapLoaded]);

  return {
    mapContainer,
    mapboxSupported,
    mapError,
    mapLoaded,
  };
};
