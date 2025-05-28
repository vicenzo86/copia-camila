import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Map } from '@/components/Map';
import FilterBar from '@/components/FilterBar';
import CategoryScroller from '@/components/CategoryScroller';
import ConstructionCard from '@/components/ConstructionCard';
import ConstructionDetails from '@/components/ConstructionDetails';
import { Construction, ConstructionFilter, CategoryOption, StatusValue } from '@/types/construction';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Calendar, Home, MapPin, Search, Loader2, CheckCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import { getAllConstructions, getCities as getSupabaseCities, getLicenseTypes as getSupabaseLicenseTypes, filterConstructions as filterSupabaseConstructions } from '@/data/supabaseService';
import useAuth from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState("map");
  const [selectedConstruction, setSelectedConstruction] = useState<Construction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filter, setFilter] = useState<ConstructionFilter>({
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allConstructions, setAllConstructions] = useState<Construction[]>([]);
  const [displayedConstructions, setDisplayedConstructions] = useState<Construction[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // Iniciar como false para evitar loading inicial
  const [initialLoading, setInitialLoading] = useState(true); // Estado separado para loading inicial
  const [error, setError] = useState<string | null>(null);

  const categories: CategoryOption[] = [
    { id: 'all', label: 'Todos', icon: <Search className="h-4 w-4" /> },
    { id: 'Aprovada', label: 'Aprovada', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'Consulta', label: 'Consulta', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'Análise', label: 'Análise', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'Residencial', label: 'Residencial', icon: <Home className="h-4 w-4" /> },
    { id: 'Comercial', label: 'Comercial', icon: <Building className="h-4 w-4" /> },
  ];

  // Obter parâmetros da URL
  const location = useLocation();
  
  // Função para buscar dados iniciais - modificada para garantir que loading seja sempre finalizado
  const fetchInitialData = useCallback(async () => {
    setInitialLoading(true); // Usar initialLoading em vez de loading
    setError(null);
    
    try {
      // Usando Promise.allSettled para garantir que todas as promessas sejam resolvidas
      // mesmo que algumas falhem
      const results = await Promise.allSettled([
        getAllConstructions(),
        getSupabaseCities(),
        getSupabaseLicenseTypes(),
      ]);
      
      // Processando os resultados individualmente
      if (results[0].status === 'fulfilled') {
        setAllConstructions(results[0].value);
        setDisplayedConstructions(results[0].value);
      } else {
        console.error("Erro ao carregar construções:", results[0].reason);
        setAllConstructions([]);
        setDisplayedConstructions([]);
      }
      
      if (results[1].status === 'fulfilled') {
        setCities(results[1].value);
      } else {
        console.error("Erro ao carregar cidades:", results[1].reason);
        setCities([]);
      }
      
      if (results[2].status === 'fulfilled') {
        setLicenseTypes(results[2].value);
      } else {
        console.error("Erro ao carregar tipos de licença:", results[2].reason);
        setLicenseTypes([]);
      }
      
      // Verificar se todas as promessas falharam para mostrar erro geral
      if (results.every(result => result.status === 'rejected')) {
        setError("Falha ao carregar dados. Tente novamente mais tarde.");
      }
    } catch (err) {
      console.error("Erro ao carregar dados iniciais:", err);
      setError("Falha ao carregar dados. Tente novamente mais tarde.");
      // Garantir que os estados sejam inicializados mesmo em caso de erro
      setAllConstructions([]);
      setDisplayedConstructions([]);
      setCities([]);
      setLicenseTypes([]);
    } finally {
      // Garantir que o loading seja sempre finalizado
      setInitialLoading(false);
    }
  }, []);

  // Processar parâmetros da URL para aplicar filtros iniciais
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get('city');
    const yearParam = params.get('year');
    const statusParam = params.get('status');
    
    // Aplicar filtros da URL, se existirem
    if (cityParam || yearParam || statusParam) {
      const newFilter: ConstructionFilter = { status: 'all' };
      
      if (cityParam) {
        newFilter.city = cityParam;
      }
      
      if (statusParam) {
        newFilter.status = statusParam as StatusValue;
      }
      
      if (yearParam) {
        // Filtrar por ano, considerando que o campo Data contém o ano
        newFilter.dateRange = {
          start: `${yearParam}-01-01`,
          end: `${yearParam}-12-31`
        };
      }
      
      setFilter(newFilter);
      
      // Se tiver status, atualizar a categoria selecionada
      if (statusParam === 'Aprovada' || statusParam === 'Consulta' || statusParam === 'Análise') {
        setSelectedCategory(statusParam);
      }
    }
    
    fetchInitialData();
  }, [fetchInitialData, location.search]);

  // Função para aplicar filtros - modificada para garantir que loading seja sempre finalizado
  const applyFilters = useCallback(async () => {
    // Não iniciar loading se estiver em loading inicial
    if (initialLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let currentFilter: ConstructionFilter = {
        ...filter,
        search: searchQuery
      };
      
      if (selectedCategory === 'Aprovada' || selectedCategory === 'Consulta' || selectedCategory === 'Análise') {
        currentFilter.status = selectedCategory as StatusValue;
      } else if (selectedCategory === 'all') {
        if (!filter.status || filter.status === 'all') {
          currentFilter.status = 'all';
        }
      }
      
      const supabaseFiltered = await filterSupabaseConstructions(currentFilter);
      setDisplayedConstructions(supabaseFiltered);
    } catch (err) {
      console.error("Erro ao filtrar construções:", err);
      setError("Falha ao filtrar dados. Tente novamente.");
      setDisplayedConstructions([]);
    } finally {
      // Garantir que o loading seja sempre finalizado
      setLoading(false);
    }
  }, [filter, searchQuery, selectedCategory, initialLoading]);

  // Modificado para remover a dependência de loading e allConstructions.length
  // que causava problemas de loop infinito
  useEffect(() => {
    // Aplicar filtros sempre que os critérios de filtro mudarem, mas apenas se não estiver em loading inicial
    if (!initialLoading) {
      applyFilters();
    }
  }, [filter, searchQuery, selectedCategory, applyFilters, initialLoading]);

  const handleFilterChange = (newFilter: ConstructionFilter) => {
    setFilter(newFilter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === 'Aprovada' || categoryId === 'Consulta' || categoryId === 'Análise') {
      setFilter(prevFilter => ({
        ...prevFilter,
        status: categoryId as StatusValue
      }));
    } else if (categoryId === 'all') {
      setFilter(prevFilter => ({
        ...prevFilter,
        status: 'all'
      }));
    }
  };

  const handleMarkerClick = (construction: Construction) => {
    setSelectedConstruction(construction);
    setIsDetailsOpen(true);
  };

  const handleViewDetails = (construction: Construction) => {
    setSelectedConstruction(construction);
    setIsDetailsOpen(true);
  };

  const clearAllFilters = () => {
    setFilter({ status: 'all' });
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Renderização condicional para loading inicial - separada do conteúdo principal
  if (initialLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando dados iniciais...</p>
      </div>
    );
  }

  // Renderização condicional para erro
  if (error && !displayedConstructions.length) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <MapPin className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-medium text-destructive">Erro ao carregar dados</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchInitialData}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Overlay de loading para filtros - agora com posição absoluta e z-index controlado */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Aplicando filtros...</p>
          </div>
        </div>
      )}
      
      <div className="container px-4 py-6 mx-auto max-w-7xl flex-1 flex flex-col relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Obra Alerta Maps</h1>
          <div className="flex items-center gap-2">
            {user?.email && <span className="text-sm text-muted-foreground mr-2">{user.email}</span>}
            <Button variant="outline" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>

        <FilterBar
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          cities={cities}
          licenseTypes={licenseTypes}
          initialFilter={filter}
          initialSearch={searchQuery}
          statusOptions={[
            {value: 'all', label: 'Todos Status'},
            {value: 'Aprovada', label: 'Aprovada'},
            {value: 'Consulta', label: 'Consulta'},
            {value: 'Análise', label: 'Análise'}
          ]}
        />

        <CategoryScroller
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Adicionar mensagem quando não há construções para exibir */}
        {!loading && !initialLoading && displayedConstructions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Nenhuma construção encontrada</h3>
            <p className="text-muted-foreground mt-2">Tente ajustar os filtros de busca</p>
            <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
              Limpar Filtros
            </Button>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="flex-1 mt-6">
            <div className="h-[500px] rounded-md overflow-hidden">
              <Map
                constructions={displayedConstructions}
                onMarkerClick={handleMarkerClick}
              />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {displayedConstructions.length} obras encontradas
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="flex-1 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedConstructions.map((construction) => (
                <ConstructionCard
                  key={construction.id}
                  construction={construction}
                  onViewDetails={() => handleViewDetails(construction)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedConstruction && (
        <ConstructionDetails
          construction={selectedConstruction}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </main>
  );
};

export default Index;
