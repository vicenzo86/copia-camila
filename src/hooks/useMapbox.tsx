import { useEffect, useRef, useState } from "react";
import { Construction } from "@/types/construction";
import { toast } from "@/components/ui/use-toast";
import { createMapMarker } from "@/components/MapMarker";
import { checkWebGLSupport, isMobileDevice } from "@/utils/webGLDetection";

declare global {
  interface Window {
    mapboxgl: any;
  }
}

const DEFAULT_MAPBOX_TOKEN = "sk.eyJ1IjoidmljZW56bzE5ODYiLCJhIjoiY21hdWpueWoxMTZ5YzJtb2Z2MzAxcHl6diJ9.y4oUGk7FYmncbQFAayKubw";

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
  const [mapboxSupported, setMapboxSupported] = useState(true); // Assume supported initially
  const [mapboxScriptLoaded, setMapboxScriptLoaded] = useState(false);
  const [checkedSupport, setCheckedSupport] = useState(false);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const maxRenderAttempts = 2;

  // Effect to check for Mapbox GL script and WebGL support
  useEffect(() => {
    let scriptCheckInterval: NodeJS.Timeout;

    const verifyMapboxScript = () => {
      if (typeof window !== "undefined" && window.mapboxgl) {
        console.log("Mapbox GL script loaded.");
        setMapboxScriptLoaded(true);
        if (scriptCheckInterval) clearInterval(scriptCheckInterval);

        // Now check WebGL support
        try {
          const isMobile = isMobileDevice();
          console.log("Device check:", { isMobile });
          const supportsWebGL = checkWebGLSupport();
          if (!supportsWebGL) {
            console.log("WebGL not supported, using fallback view");
            setMapboxSupported(false);
            setMapError(
              isMobile
                ? "Seu dispositivo móvel não suporta mapas 3D. Usando visualização em lista."
                : "Seu navegador não suporta WebGL, necessário para exibir o mapa."
            );
          } else {
            setMapboxSupported(true); // Explicitly set to true if WebGL is supported
          }
        } catch (error) {
          console.error("Erro ao verificar suporte WebGL:", error);
          setMapboxSupported(false);
          setMapError("Erro ao verificar compatibilidade do navegador.");
        }
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
    if (!mapboxScriptLoaded || !mapContainer.current || !mapboxToken || !checkedSupport || !mapboxSupported || renderAttempts >= maxRenderAttempts) {
      console.log("Map initialization skipped:", {
        mapboxScriptLoaded,
        hasContainer: !!mapContainer.current,
        hasToken: !!mapboxToken,
        checkedSupport,
        mapboxSupported,
        renderAttempts,
      });
      if (checkedSupport && !mapboxSupported && !mapError) {
        // If support check is done and mapbox is not supported, but no specific error is set yet
        setMapError("Mapbox não é suportado neste navegador ou dispositivo.")
      }
      return;
    }

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      console.log("Initializing Mapbox with token:", mapboxToken);
      window.mapboxgl.accessToken = mapboxToken;
      window.mapboxgl.workerCount = 2;

      const mapStyle =
        renderAttempts > 0
          ? "mapbox://styles/mapbox/light-v11"
          : "mapbox://styles/mapbox/streets-v12";

      const newMap = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: center,
        zoom: zoom,
        attributionControl: true,
        preserveDrawingBuffer: true, // May help with some rendering issues
        antialias: false,
        fadeDuration: 0,
        maxZoom: 19,
        minZoom: 3,
        pitch: 0,
        renderWorldCopies: true,
        maxParallelImageRequests: 4,
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
        if (renderAttempts < maxRenderAttempts - 1) {
          console.log(`Retry attempt ${renderAttempts + 1} of ${maxRenderAttempts}`);
          setRenderAttempts((prev) => prev + 1);
          return;
        }
        setMapError("Erro ao carregar o mapa. Usando visualização alternativa.");
        setMapboxSupported(false);
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
      setMapboxSupported(false);
      if (error instanceof Error) {
        console.error("Mapbox initialization error details:", {
          message: error.message,
          stack: error.stack,
        });
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
  }, [mapboxScriptLoaded, mapboxToken, center, zoom, checkedSupport, mapboxSupported, renderAttempts]);

  // Add markers to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !mapboxToken || !mapboxSupported || !mapboxScriptLoaded) return;

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
  }, [constructions, mapboxToken, onMarkerClick, mapLoaded, mapboxSupported, mapboxScriptLoaded]);

  return {
    mapContainer,
    mapboxSupported,
    mapError,
    mapLoaded,
  };
};
