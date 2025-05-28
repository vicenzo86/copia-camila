// src/types/construction.ts
export type StatusValue = "Aprovada" | "Análise" | "Consulta" | string;

export interface Construction {
  id?: string;
  "Nome da Empresa": string;
  "CNPJ": string;
  "Endereço": string;
  "Cidade": string;
  "Tipo de Licença": string;
  "Data": string;
  "Nome do Arquivo": string;
  status: StatusValue;
  latitude: number;
  longitude: number;
  "Área Construída"?: number;
  "Área do Terreno"?: number;
}

export interface ConstructionFilter {
  status?: StatusValue;
  dateRange?: {
    start?: string;
    end?: string;
  };
  city?: string;
  cities?: string[]; // Adicionado suporte para múltiplas cidades
  licenseType?: string;
  search?: string;
}

export interface CategoryOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}
