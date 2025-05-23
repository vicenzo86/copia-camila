import React from 'react';
import { Construction, StatusValue } from '@/types/construction';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { MapPin, Calendar, Building, ArrowRight, CheckCircle, HelpCircle, AlertTriangle, FileText } from 'lucide-react';

interface ConstructionCardProps {
  construction: Construction;
  onViewDetails?: (construction: Construction) => void;
}

const getStatusBadgeProps = (status: StatusValue): { variant: "default" | "outline" | "secondary" | "destructive" | null | undefined, className: string, icon?: React.ReactNode, label: string } => {
  switch (status) {
    case "Aprovada":
      return { variant: "outline", className: "border-green-500 text-green-700 bg-green-50", icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />, label: "Aprovada" };
    case "Consulta":
      return { variant: "outline", className: "border-blue-500 text-blue-700 bg-blue-50", icon: <HelpCircle className="h-3.5 w-3.5 mr-1" />, label: "Consulta" };
    case "Análise":
      return { variant: "outline", className: "border-yellow-500 text-yellow-700 bg-yellow-50", icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />, label: "Análise" };
    default:
      // Fallback para caso o status não seja um dos esperados, embora a tipagem deva garantir isso.
      return { variant: "outline", className: "border-gray-500 text-gray-700 bg-gray-50", label: status }; 
  }
};

const ConstructionCard: React.FC<ConstructionCardProps> = ({ 
  construction,
  onViewDetails 
}) => {
  const {
    "Endereço": address,
    status,
    "Data": documentDate,
    "Área Construída": constructionArea,
    "Área do Terreno": landArea,
    "Tipo de Licença": licenseType,
    "Nome da Empresa": companyName,
    "Cidade": city
  } = construction;

  let dateFormatted = "Data não disponível";
  if (documentDate) {
    try {
      dateFormatted = formatDistanceToNow(new Date(documentDate.replace(/\//g, '-')), {
        addSuffix: true,
        locale: ptBR
      });
    } catch (e) {
      console.error("Error formatting date in Card:", documentDate, e);
    }
  }

  const getGoogleMapsLink = () => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((address || "") + ', ' + (city || ""))}`;
  };

  const statusProps = getStatusBadgeProps(status);

  return (
    <Card className="w-full overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">{companyName || "Empresa não disponível"}</CardTitle>
          <Badge variant={statusProps.variant} className={statusProps.className}>
            {statusProps.icon}
            {statusProps.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-grow">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="line-clamp-1">{city || "Cidade não disponível"}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span>{dateFormatted}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Building className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="line-clamp-1">{address || "Endereço não disponível"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-muted px-2 py-1 rounded-md">
              <p className="text-xs text-muted-foreground">Área construção</p>
              <p className="font-medium">{constructionArea ? `${constructionArea} m²` : "N/A"}</p>
            </div>
            <div className="bg-muted px-2 py-1 rounded-md">
              <p className="text-xs text-muted-foreground">Área terreno</p>
              <p className="font-medium">{landArea ? `${landArea} m²` : "N/A"}</p>
            </div>
          </div>

          <div className="bg-muted px-2 py-1 rounded-md mt-2">
            <p className="text-xs text-muted-foreground">Tipo de licença</p>
            <p className="font-medium">{licenseType || "N/A"}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        {(address || city) && (
          <Button variant="outline" size="sm" asChild>
            <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer">
              Ir para o local
            </a>
          </Button>
        )}
        {onViewDetails && (
          <Button variant="default" size="sm" onClick={() => onViewDetails?.(construction)}>
            <span>Detalhes</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ConstructionCard;
