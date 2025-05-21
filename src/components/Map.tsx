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
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          background: #c30b82;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -15px 0 0 -15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-pin::after {
          content: '';
          width: 24px;
          height: 24px;
          margin: 3px 0 0 3px;
          background: #fff;
          position: absolute;
          border-radius: 50%;
        }
        .marker-text {
          transform: rotate(45deg);
          color: #000;
          font-weight: bold;
          font-size: 12px;
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

// Aplicar React.memo para evitar renderizações desnecessárias
export const Map = React.memo(MapComponent);

// Exportar também como exportação nomeada para compatibilidade
export { Map as default };
