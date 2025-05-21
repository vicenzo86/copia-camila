import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState, useRef } from 'react';
import { Construction, StatusValue } from '@/types/construction';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Building2, CalendarDays, MapPin, FileText, ExternalLink, Briefcase, Info, CheckCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ConstructionDetailsProps {
  construction: Construction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function para obter props do badge de status
const getStatusBadgeProps = (status: StatusValue): { variant: "default" | "outline" | "secondary" | "destructive" | null | undefined, className: string, icon?: React.ReactNode, label: string } => {
  switch (status) {
    case "Aprovada":
      return { variant: "outline", className: "border-green-500 text-green-700 bg-green-50", icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />, label: "Aprovada" };
    case "Consulta":
      return { variant: "outline", className: "border-blue-500 text-blue-700 bg-blue-50", icon: <HelpCircle className="h-3.5 w-3.5 mr-1" />, label: "Consulta" };
    case "Análise":
      return { variant: "outline", className: "border-yellow-500 text-yellow-700 bg-yellow-50", icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />, label: "Análise" };
    default:
      return { variant: "outline", className: "border-gray-500 text-gray-700 bg-gray-50", label: status };
  }
};

const ConstructionDetails: React.FC<ConstructionDetailsProps> = ({ construction, open, onOpenChange }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  
  // Efeito para detectar o tamanho da tela e ajustar o tamanho do diálogo
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Efeito para inicializar o mapa Leaflet quando o popup estiver aberto
  useEffect(() => {
    if (!open || !construction || !mapRef.current) return;
    
    // Limpar mapa anterior se existir
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    
    const { latitude, longitude } = construction;
    
    if (!latitude || !longitude) return;
    
    // Pequeno timeout para garantir que o DOM esteja pronto
    setTimeout(() => {
      if (!mapRef.current) return;
      
      // Inicializar mapa
      const map = L.map(mapRef.current, {
        center: [latitude, longitude],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false
      });
      
      // Adicionar camada de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      } ).addTo(map);
      
      // Adicionar marcador
      L.marker([latitude, longitude]).addTo(map);
      
      // Guardar referência do mapa
      leafletMapRef.current = map;
      
      // Forçar atualização do mapa após renderização
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }, 100);
    
    // Cleanup ao fechar o popup
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [open, construction]);
  
  // Calcular largura do diálogo (70% da tela)
  const dialogWidth = Math.min(windowWidth * 0.7, 500); // Máximo de 500px para não ficar muito grande em telas grandes
  
  if (!construction) return null;

  const { 
    "Endereço": address, 
    status,
    "Data": documentDate, 
    "Tipo de Licença": licenseType, 
    "Nome do Arquivo": fileName, 
    "CNPJ": cnpj, 
    "Nome da Empresa": companyName, 
    "Cidade": city, 
    latitude, 
    longitude, 
    "Área Construída": constructionArea, 
    "Área do Terreno": landArea 
  } = construction;

  const statusProps = getStatusBadgeProps(status);
  const primaryLicenseInfo = licenseType || "Não Informado";

  let formattedDate = "Data não informada";
  if (documentDate) {
    try {
      const dateParts = documentDate.split('/');
      if (dateParts.length === 3) {
        const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        formattedDate = format(new Date(isoDate), "dd/MM/yyyy", { locale: ptBR });
      } else {
        formattedDate = format(new Date(documentDate), "dd/MM/yyyy", { locale: ptBR });
      }
    } catch (e) {
      console.error("Erro ao formatar data em ConstructionDetails:", documentDate, e);
    }
  }

  const getGoogleMapsLink = () => {
    if (latitude && longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((address || "" ) + ', ' + (city || ""))}`;
  };

  const descriptionText = `Licença de Operação para ${companyName || "a empresa"}. Status atual: ${statusProps.label}.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0" style={{ maxWidth: `${dialogWidth}px`, width: '100%', margin: '0 auto' }}>
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-xl font-semibold text-gray-800">{companyName || "Nome da Empresa"}</DialogTitle>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={statusProps.variant} className={statusProps.className}>
              {statusProps.icon}
              {statusProps.label}
            </Badge>
            <span className="text-sm text-gray-600">{primaryLicenseInfo}</span>
          </div>
        </DialogHeader>
        
        <div className="px-4 pb-4 space-y-3">
          <section>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Informações da Empresa</h4>
            <div className="space-y-1">
              <div className="flex items-center text-gray-700">
                <Briefcase className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="text-xs">CNPJ: {cnpj || "Não informado"}</span>
              </div>
              <div className="flex items-start text-gray-700">
                <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{(address || "Endereço não informado") + ", " + (city || "Cidade não informada")}</span>
              </div>
            </div>
          </section>
          
          <Separator className="my-2" />
          
          <section>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Detalhes da Licença</h4>
            <div className="space-y-1">
              <div className="flex items-center text-gray-700">
                <CalendarDays className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="text-xs">Emitida em: {formattedDate}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FileText className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="text-xs">{fileName || "Não informado"}</span>
              </div>
            </div>
          </section>
          
          <Separator className="my-2" />
          
          <section>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Localização</h4>
            <div className="space-y-1 mb-2">
              <span className="text-xs text-gray-700">Lat: {latitude || "N/A"}, Lng: {longitude || "N/A"}</span>
            </div>
            <div className="h-24 bg-gray-200 rounded-md flex items-center justify-center relative overflow-hidden">
              {/* Mapa Leaflet */}
              <div 
                ref={mapRef} 
                className="w-full h-full" 
                style={{ zIndex: 1 }}
              />
              
              {(address || (latitude && longitude)) && (
                <Button variant="outline" size="sm" className="absolute bottom-1 right-1 bg-white hover:bg-gray-50 shadow-md py-1 px-2 h-auto text-xs z-10" asChild>
                  <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver no Google Maps
                  </a>
                </Button>
              )}
            </div>
          </section>
        </div>
        
        <DialogFooter className="p-3 pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Ver Documento Completo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConstructionDetails;
