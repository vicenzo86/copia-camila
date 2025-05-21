import React from 'react';
import { Construction, StatusValue } from '@/types/construction';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Building2, CalendarDays, MapPin, FileText, ExternalLink, Briefcase, Info, CheckCircle, HelpCircle, AlertTriangle } from 'lucide-react';

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
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-800">{companyName || "Nome da Empresa"}</DialogTitle>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={statusProps.variant} className={statusProps.className}>
              {statusProps.icon}
              {statusProps.label}
            </Badge>
            <span className="text-gray-600">{primaryLicenseInfo}</span>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-5">
          <section>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Informações da Empresa</h4>
            <div className="space-y-1.5">
              <div className="flex items-center text-gray-700">
                <Briefcase className="h-4 w-4 mr-2.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm">CNPJ: {cnpj || "Não informado"}</span>
              </div>
              <div className="flex items-start text-gray-700">
                <MapPin className="h-4 w-4 mr-2.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{(address || "Endereço não informado") + ", " + (city || "Cidade não informada")}</span>
              </div>
            </div>
          </section>
          
          <Separator />
          
          <section>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Detalhes da Licença</h4>
            <div className="space-y-1.5">
              <div className="flex items-center text-gray-700">
                <CalendarDays className="h-4 w-4 mr-2.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm">Emitida em: {formattedDate}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FileText className="h-4 w-4 mr-2.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm">{fileName || "Não informado"}</span>
              </div>
            </div>
          </section>
          
          <Separator />
          
          <section>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Descrição</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">{descriptionText}</p>
            </div>
          </section>
          
          <Separator />
          
          <section>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Localização</h4>
            <div className="space-y-1.5 mb-3">
              <span className="text-sm text-gray-700">Lat: {latitude || "N/A"}, Lng: {longitude || "N/A"}</span>
            </div>
            <div className="h-32 bg-gray-200 rounded-md flex items-center justify-center relative overflow-hidden">
              <img 
                src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+0074D9(${longitude || 0},${latitude || 0} )/${longitude || 0},${latitude || 0},9,0/300x128?access_token=pk.eyJ1IjoidmljZW56bzE5ODYiLCJhIjoiY21hOTJ1dDk3MW43ajJwcHdtancwbG9zbSJ9.TTMx21fG8mpx04i1h2hl-Q`} 
                alt="Miniatura do Mapa" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {(address || (latitude && longitude)) && (
                <Button variant="outline" size="sm" className="absolute bottom-2 right-2 bg-white hover:bg-gray-50 shadow-md" asChild>
                  <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Ver no Google Maps
                  </a>
                </Button>
              )}
            </div>
          </section>
        </div>
        
        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Ver Documento Completo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConstructionDetails;
