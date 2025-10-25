import { supabase } from "@/lib/supabaseClient";
import { Construction, ConstructionFilter, StatusValue, SupabaseConstruction } from "@/types/construction";

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
const mapSupabaseDataToConstruction = (data: SupabaseConstruction): Construction => {
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
    "Área Construída": data["Área Construída"] || 0,
    "Área do Terreno": data["Área do Terreno"] || 0,
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    status: data.status || "Análise"
  } as Construction;
};

/**
 * Busca construções na view com filtros opcionais
 */
export async function getConstructions(filters?: ConstructionFilter): Promise<Construction[]> {
  try {
    let query = supabase.from(VIEW_NAME).select("*");

    if (filters) {
      if (filters.cidade && filters.cidade.length > 0) {
        query = query.in("Cidade", filters.cidade);
      }
      if (filters.tipoLicenca && filters.tipoLicenca.length > 0) {
        query = query.in("Tipo de Licença", filters.tipoLicenca);
      }
      if (filters.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }
      if (filters.search) {
        query = query.or(
          `Nome da Empresa.ilike.%${filters.search}%,Endereço.ilike.%${filters.search}%,CNPJ.ilike.%${filters.search}%`
        );
      }
      if (filters.areaConstruidaMin !== undefined) {
        query = query.gte("Área Construída", filters.areaConstruidaMin);
      }
      if (filters.areaConstruidaMax !== undefined) {
        query = query.lte("Área Construída", filters.areaConstruidaMax);
      }
      if (filters.areaTerrenoMin !== undefined) {
        query = query.gte("Área do Terreno", filters.areaTerrenoMin);
      }
      if (filters.areaTerrenoMax !== undefined) {
        query = query.lte("Área do Terreno", filters.areaTerrenoMax);
      }
    }

    const { data, error } = await query.limit(10000);

    if (error) {
      console.error("Erro ao buscar construções:", error);
      throw error;
    }

    return (data || []).map(mapSupabaseDataToConstruction);
  } catch (error) {
    console.error("Erro em getConstructions:", error);
    throw error;
  }
}

/**
 * Busca uma construção específica pelo ID
 */
export async function getConstructionById(id: string): Promise<Construction | null> {
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar construção:", error);
      throw error;
    }

    return data ? mapSupabaseDataToConstruction(data) : null;
  } catch (error) {
    console.error("Erro em getConstructionById:", error);
    throw error;
  }
}

/**
 * Busca todas as cidades únicas das construções
 * Versão robusta com filtros explícitos, normalização e ordenação
 */
export async function getCities(): Promise<string[]> {
  try {
    console.log('[getCities] Iniciando busca de cidades...');
    
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("Cidade")
      .not('Cidade', 'is', null)
      .not('Cidade', 'eq', '')
      .order('Cidade', { ascending: true });

    if (error) {
      console.error('[getCities] Erro ao buscar cidades:', error);
      throw error;
    }

    console.log('[getCities] Dados brutos recebidos:', data?.length || 0, 'registros');

    if (!data || data.length === 0) {
      console.log('[getCities] Nenhuma cidade encontrada');
      return [];
    }

    // Filtrar, normalizar e deduplicar
    const cities = data
      .map(item => item.Cidade)
      .filter((city): city is string => {
        const isValid = typeof city === 'string' && city.trim() !== '';
        if (!isValid && city !== null && city !== undefined) {
          console.log('[getCities] Cidade inválida filtrada:', city);
        }
        return isValid;
      })
      .map(city => city.trim())
      .filter((city, index, self) => self.indexOf(city) === index);

    console.log('[getCities] Cidades únicas após processamento:', cities.length);
    console.log('[getCities] Lista de cidades:', cities);

    // Ordenar usando localeCompare com regras pt-BR
    cities.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    console.log('[getCities] Cidades ordenadas:', cities);
    return cities;
  } catch (error) {
    console.error('[getCities] Erro na função:', error);
    throw error;
  }
}

/**
 * Busca todos os tipos de licença únicos
 */
export async function getLicenseTypes(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from(VIEW_NAME)
      .select("Tipo de Licença");

    if (error) {
      console.error("Erro ao buscar tipos de licença:", error);
      throw error;
    }

    const uniqueTypes = Array.from(
      new Set(
        (data || [])
          .map((item) => item["Tipo de Licença"])
          .filter((type): type is string => !!type)
      )
    );

    return uniqueTypes.sort();
  } catch (error) {
    console.error("Erro em getLicenseTypes:", error);
    throw error;
  }
}

/**
 * Retorna todos os valores possíveis de status
 */
export function getStatusValues(): StatusValue[] {
  return ["Análise", "Aprovado", "Em andamento", "Concluído"];
}
