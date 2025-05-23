import React, { useMemo, useState } from "react";
import { useLeafletMap } from "@/hooks/useLeafletMap";
import { Construction } from "@/types/construction";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ConstructionDetails from "./ConstructionDetails";

interface MapProps {
  constructions: Construction[];
  onMarkerClick?: (construction: Construction) => void;
  center?: [number, number];
  zoom?: number;
}

function MapComponent({
  constructions,
  onMarkerClick,
  center,
  zoom,
}: MapProps) {
  // Estado para controlar o popup
  const [selectedConstruction, setSelectedConstruction] = useState<Construction | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Handler para clique no marcador
  const handleMarkerClick = (construction: Construction) => {
    setSelectedConstruction(construction);
    setIsPopupOpen(true);
    
    // Se houver um handler externo, também o chamamos
    if (onMarkerClick) {
      onMarkerClick(construction);
    }
  };

  // Use useMemo para evitar recálculos desnecessários das props
  const mapProps = useMemo(() => ({
    constructions,
    onMarkerClick: handleMarkerClick, // Usamos nosso handler interno
    center,
    zoom,
  }), [constructions, center, zoom]);

  const { mapContainer, mapLoaded, mapError } = useLeafletMap(mapProps);

  return (
    <div className="relative w-full h-full" style={{ minHeight: "500px", position: "relative" }}>
      {mapError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{mapError}</AlertDescription>
        </Alert>
      )}
      
      <div
        ref={mapContainer}
        className="w-full h-full rounded-md overflow-hidden"
        style={{
          height: "500px",
          position: "relative",
          zIndex: 1,
          visibility: "visible",
          opacity: 1
        }}
      />
      
      {/* Componente de popup/detalhes */}
      <ConstructionDetails 
        construction={selectedConstruction}
        open={isPopupOpen}
        onOpenChange={setIsPopupOpen}
      />
      
      {/* Estilos para os marcadores */}
      <style jsx global>{`
        .custom-marker {
          background: none;
          border: none;
        }
        .marker-container {
          position: relative;
          width: 40px;
          height: 40px;
        }
        .marker-id {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-weight: bold;
          font-size: 10px;
          text-shadow: 0px 0px 2px rgba(0,0,0,0.5);
          z-index: 2;
        }
      `}</style>
    </div>
  );
}

// Aplicar React.memo para evitar renderizações desnecessárias
export const Map = React.memo(MapComponent);

// Exportar também como exportação nomeada para compatibilidade
export { Map as default };
