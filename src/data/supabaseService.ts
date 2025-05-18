import { supabase } from "@/lib/supabaseClient";
import { Construction, ConstructionFilter, StatusValue } from "@/types/construction";

// Nome da tabela no Supabase com schema
const TABLE_NAME = "construleads.constructions";

const mapSupabaseDataToConstruction = (data: any): Construction => {
  return {
    id: data.id || data["Nome do Arquivo"],
    "Nome do Arquivo": data["Nome do Arquivo"],
    "Data": data["Data"],
    "Tipo de Licença": data["Tipo de Licença"],
    "CNPJ": data["CNPJ"],
    "Endereço": data["Endereço"],
    "Nome da Empresa": data["Nome da Empresa"],
    "Cidade": data["Cidade"],
    "Área Construída": parseFloat(data["Área Construída"]) || 0,
    "Área do Terreno": parseFloat(data["Área do Terreno"]) || 0,
    latitude: parseFloat(data.latitude) || 0,
    longitude: parseFloat(data.longitude) || 0,
    status: data.status as StatusValue
  } as Construction;
};

export const getAllConstructions = async (): Promise<Construction[]> => {
  const { data, error } = await supabase.from(TABLE_NAME).select("*");
  if (error) {
    console.error("Erro ao buscar construções:", error);
    throw error;
  }
  return data ? data.map(mapSupabaseDataToConstruction) : [];
};

export const getCities = async (): Promise<string[]> => {
  const { data, error } = await supabase.from(TABLE_NAME).select("\"Cidade\"");
  if (error) {
    console.error("Erro ao buscar cidades:", error);
    throw error;
  }
  const cities = [...new Set((data as { "Cidade": string }[]).map(item => item["Cidade"]))];
  return cities.sort();
};

export const getLicenseTypes = async (): Promise<string[]> => {
  const { data, error } = await supabase.from(TABLE_NAME).select("\"Tipo de Licença\"");
  if (error) {
    console.error("Erro ao buscar tipos de licença:", error);
    throw error;
  }
  const types = [...new Set((data as { "Tipo de Licença": string }[]).map(item => item["Tipo de Licença"]))];
  return types.sort();
};

export const filterConstructions = async (
  filter: ConstructionFilter
): Promise<Construction[]> => {
  let query = supabase.from(TABLE_NAME).select("*");

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
    query = query.or([
      { "Endereço": { ilike: searchTerm } },
      { "Nome da Empresa": { ilike: searchTerm } },
      { "Cidade": { ilike: searchTerm } }
    ]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao filtrar construções:", error);
    throw error;
  }
  return data ? data.map(mapSupabaseDataToConstruction) : [];
};