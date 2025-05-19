import { supabase } from "@/lib/supabaseClient";
import { Construction, ConstructionFilter, StatusValue } from "@/types/construction";

// Nome da view no schema public do Supabase
const VIEW_NAME = "constructions_view";

/**
 * Cria um objeto Construction vazio com valores padrão
 */
const createEmptyConstruction = (): Construction => {
  return {
    id: "",
    "Nome do Arquivo": "",
    "Data": "",
    "Tipo de Licença": "",
    "CNPJ": "",
    "Endereço": "",
    "Nome da Empresa": "",
    "Cidade": "",
    "Área Construída": 0,
    "Área do Terreno": 0,
    latitude: 0,
    longitude: 0,
    status: "Análise"
  } as Construction;
};

/**
 * Mapeia os dados do Supabase para o tipo Construction
 * Inclui tratamento de valores nulos ou indefinidos
 */
const mapSupabaseDataToConstruction = (data: any): Construction => {
  if (!data) return createEmptyConstruction();
  
  return {
    id: data.id || data["Nome do Arquivo"] || "",
    "Nome do Arquivo": data["Nome do Arquivo"] || "",
    "Data": data["Data"] || "",
    "Tipo de Licença": data["Tipo de Licença"] || "",
    "CNPJ": data["CNPJ"] || "",
    "Endereço": data["Endereço"] || "",
    "Nome da Empresa": data["Nome da Empresa"] || "",
    "Cidade": data["Cidade"] || "",
    "Área Construída": parseFloat(data["Área Construída"] || "0") || 0,
    "Área do Terreno": parseFloat(data["Área do Terreno"] || "0") || 0,
    latitude: parseFloat(data.latitude || "0") || 0,
    longitude: parseFloat(data.longitude || "0") || 0,
    status: (data.status as StatusValue) || "Análise" // Valor padrão caso status seja nulo
  } as Construction;
};

/**
 * Busca todas as construções da view
 * Sempre retorna um array, mesmo em caso de erro
 */
export const getAllConstructions = async (): Promise<Construction[]> => {
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("*");
    
    if (error) {
      console.error("Erro ao buscar construções:", error);
      return []; // Retorna array vazio em caso de erro
    }
    
    // Garante que data seja um array antes de mapear
    if (!data || !Array.isArray(data)) {
      console.warn("Nenhum dado retornado ou dados não estão em formato de array");
      return [];
    }
    
    // Mapeia os dados para o formato Construction antes de retornar
    return data.map(item => mapSupabaseDataToConstruction(item));
  } catch (err) {
    console.error("Exceção ao buscar construções:", err);
    return []; // Retorna array vazio em caso de exceção
  }
};

/**
 * Busca todas as cidades disponíveis
 * Sempre retorna um array, mesmo em caso de erro
 */
export const getCities = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("\"Cidade\"");
    
    if (error) {
      console.error("Erro ao buscar cidades:", error);
      return []; // Retorna array vazio em caso de erro
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn("Nenhum dado retornado ou dados não estão em formato de array");
      return [];
    }
    
    // Filtra valores nulos ou vazios antes de retornar
    const cities = [...new Set((data as { "Cidade": string }[])
      .map(item => item["Cidade"])
      .filter(city => city && city.trim() !== "")
    )];
    
    return cities.sort();
  } catch (err) {
    console.error("Exceção ao buscar cidades:", err);
    return []; // Retorna array vazio em caso de exceção
  }
};

/**
 * Busca todos os tipos de licença disponíveis
 * Sempre retorna um array, mesmo em caso de erro
 */
export const getLicenseTypes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("\"Tipo de Licença\"");
    
    if (error) {
      console.error("Erro ao buscar tipos de licença:", error);
      return []; // Retorna array vazio em caso de erro
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn("Nenhum dado retornado ou dados não estão em formato de array");
      return [];
    }
    
    // Filtra valores nulos ou vazios antes de retornar
    const types = [...new Set((data as { "Tipo de Licença": string }[])
      .map(item => item["Tipo de Licença"])
      .filter(type => type && type.trim() !== "")
    )];
    
    return types.sort();
  } catch (err) {
    console.error("Exceção ao buscar tipos de licença:", err);
    return []; // Retorna array vazio em caso de exceção
  }
};

/**
 * Filtra construções com base nos critérios fornecidos
 * Sempre retorna um array, mesmo em caso de erro
 */
export const filterConstructions = async (
  filter: ConstructionFilter
): Promise<Construction[]> => {
  try {
    let query = supabase
      .from(VIEW_NAME)
      .select("*");

    // Aplicação dos filtros
    if (filter.status && filter.status !== "all") {
      query = query.eq("status", filter.status);
    }

    if (filter.dateRange) {
      if (filter.dateRange.start) {
        query = query.gte("\"Data\"", filter.dateRange.start);
      }
      if (filter.dateRange.end) {
        query = query.lte("\"Data\"", filter.dateRange.end);
      }
    }

    if (filter.city) {
      query = query.eq("\"Cidade\"", filter.city);
    }

    if (filter.licenseType) {
      query = query.eq("\"Tipo de Licença\"", filter.licenseType);
    }

    if (filter.search && filter.search.trim() !== "") {
      const searchTerm = `%${filter.search.toLowerCase()}%`;
      query = query.or(`"Endereço".ilike.${searchTerm},"Nome da Empresa".ilike.${searchTerm},"Cidade".ilike.${searchTerm}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao filtrar construções:", error);
      return []; // Retorna array vazio em caso de erro
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn("Nenhum dado retornado ou dados não estão em formato de array");
      return [];
    }
    
    return data.map(item => mapSupabaseDataToConstruction(item));
  } catch (err) {
    console.error("Exceção ao filtrar construções:", err);
    return []; // Retorna array vazio em caso de exceção
  }
};

/**
 * Função simplificada para buscar todas as construções
 * Compatível com a versão anterior do código
 */
export async function fetchConstructions(): Promise<Construction[]> {
  console.log("Fetching constructions from Supabase");
  
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("*");
    
    if (error) {
      console.error("Supabase error:", error);
      return []; // Retorna array vazio em caso de erro
    }
    
    // Garante que data seja um array antes de mapear
    if (!data || !Array.isArray(data)) {
      console.warn("No data returned or data is not an array");
      return [];
    }
    
    // Mapeia os dados para o formato Construction antes de retornar
    return data.map(item => mapSupabaseDataToConstruction(item));
  } catch (error) {
    console.error("Error fetching constructions:", error);
    return []; // Retorna array vazio em caso de exceção
  }
}
