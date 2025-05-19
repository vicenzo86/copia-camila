import { useLeafletMap } from "@/hooks/useLeafletMap";
import { Construction } from "@/types/construction";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MapProps {
  constructions: Construction[];
  onMarkerClick?: (construction: Construction) => void;
  center?: [number, number];
  zoom?: number;
}

export function Map({
  constructions,
  onMarkerClick,
  center,
  zoom,
}: MapProps) {
  const { mapContainer, mapLoaded, mapError } = useLeafletMap({
    constructions,
    onMarkerClick,
    center,
    zoom,
  });

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {mapError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{mapError}</AlertDescription>
        </Alert>
      )}
      
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[400px] rounded-md overflow-hidden"
      />
      
      {/* Adicione este CSS inline para os marcadores personalizados */}
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
