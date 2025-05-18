import { supabase } from "@/lib/supabaseClient";
import { Construction, ConstructionFilter, StatusValue } from "@/types/construction";

// Nome da view no schema public do Supabase
const VIEW_NAME = "constructions_view";

/**
 * Mapeia os dados do Supabase para o tipo Construction
 * Inclui tratamento de valores nulos ou indefinidos
 */
const mapSupabaseDataToConstruction = (data: any): Construction => {
  return {
    id: data.id || data["Nome do Arquivo"] || "",
    "Nome do Arquivo": data["Nome do Arquivo"] || "",
    "Data": data["Data"] || "",
    "Tipo de Licença": data["Tipo de Licença"] || "",
    "CNPJ": data["CNPJ"] || "",
    "Endereço": data["Endereço"] || "",
    "Nome da Empresa": data["Nome da Empresa"] || "",
    "Cidade": data["Cidade"] || "",
    "Área Construída": parseFloat(data["Área Construída"]) || 0,
    "Área do Terreno": parseFloat(data["Área do Terreno"]) || 0,
    latitude: parseFloat(data.latitude) || 0,
    longitude: parseFloat(data.longitude) || 0,
    status: (data.status as StatusValue) || "Análise" // Valor padrão caso status seja nulo
  } as Construction;
};

/**
 * Busca todas as construções da view
 */
export const getAllConstructions = async (): Promise<Construction[]> => {
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("*");
    
    if (error) {
      console.error("Erro ao buscar construções:", error);
      throw error;
    }
    
    return data ? data.map(mapSupabaseDataToConstruction) : [];
  } catch (err) {
    console.error("Exceção ao buscar construções:", err);
    throw err;
  }
};

/**
 * Busca todas as cidades disponíveis
 */
export const getCities = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("\"Cidade\"");
    
    if (error) {
      console.error("Erro ao buscar cidades:", error);
      throw error;
    }
    
    // Filtra valores nulos ou vazios antes de retornar
    const cities = [...new Set((data as { "Cidade": string }[])
      .map(item => item["Cidade"])
      .filter(city => city && city.trim() !== "")
    )];
    
    return cities.sort();
  } catch (err) {
    console.error("Exceção ao buscar cidades:", err);
    throw err;
  }
};

/**
 * Busca todos os tipos de licença disponíveis
 */
export const getLicenseTypes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("\"Tipo de Licença\"");
    
    if (error) {
      console.error("Erro ao buscar tipos de licença:", error);
      throw error;
    }
    
    // Filtra valores nulos ou vazios antes de retornar
    const types = [...new Set((data as { "Tipo de Licença": string }[])
      .map(item => item["Tipo de Licença"])
      .filter(type => type && type.trim() !== "")
    )];
    
    return types.sort();
  } catch (err) {
    console.error("Exceção ao buscar tipos de licença:", err);
    throw err;
  }
};

/**
 * Filtra construções com base nos critérios fornecidos
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
      throw error;
    }
    
    return data ? data.map(mapSupabaseDataToConstruction) : [];
  } catch (err) {
    console.error("Exceção ao filtrar construções:", err);
    throw err;
  }
};