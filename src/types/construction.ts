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
