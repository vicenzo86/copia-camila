import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Map } from '@/components/Map';
import FilterBar from '@/components/FilterBar';
import CategoryScroller from '@/components/CategoryScroller';
import ConstructionCard from '@/components/ConstructionCard';
import ConstructionDetails from '@/components/ConstructionDetails';
import { Construction, ConstructionFilter, CategoryOption, StatusValue } from '@/types/construction';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Calendar, Home, MapPin, Search, Loader2, CheckCircle, HelpCircle, AlertTriangle } from 'lucide-react'; // Adicionando ícones para novos status
import {
  getAllConstructions,
  getCities as getSupabaseCities,
  getLicenseTypes as getSupabaseLicenseTypes,
  filterConstructions as filterSupabaseConstructions
} from '@/data/supabaseService';
import useAuth from '@/hooks/useAuth';

const Index = () => {
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState("map");
  const [selectedConstruction, setSelectedConstruction] = useState<Construction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  // Ajustar o filtro inicial de status para usar os novos valores ou 'all'
  const [filter, setFilter] = useState<ConstructionFilter>({ status: 'all' }); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [allConstructions, setAllConstructions] = useState<Construction[]>([]);
  const [displayedConstructions, setDisplayedConstructions] = useState<Construction[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Atualizar categorias para refletir os novos status e talvez remover as antigas
  const categories: CategoryOption[] = [
    { id: 'all', label: 'Todos', icon: <Search className="h-4 w-4" /> },
    { id: 'Aprovada', label: 'Aprovada', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'Consulta', label: 'Consulta', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'Análise', label: 'Análise', icon: <AlertTriangle className="h-4 w-4" /> },
    // Manter categorias de tipo de licença se ainda forem relevantes
    { id: 'Residencial', label: 'Residencial', icon: <Home className="h-4 w-4" /> },
    { id: 'Comercial', label: 'Comercial', icon: <Building className="h-4 w-4" /> },
  ];

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [constructionsData, citiesData, licenseTypesData] = await Promise.all([
        getAllConstructions(),
        getSupabaseCities(),
        getSupabaseLicenseTypes(),
      ]);
      setAllConstructions(constructionsData);
      setDisplayedConstructions(constructionsData);
      setCities(citiesData);
      setLicenseTypes(licenseTypesData);
    } catch (err) {
      console.error("Erro ao carregar dados iniciais:", err);
      setError("Falha ao carregar dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const applyFilters = useCallback(async () => {
    if (loading && !allConstructions.length) return;
    setLoading(true);
    setError(null);
    try {
      let currentFilter: ConstructionFilter = { ...filter, search: searchQuery };

      // Lógica de categoria para os novos status e tipos de licença
      if (selectedCategory === 'Aprovada' || selectedCategory === 'Consulta' || selectedCategory === 'Análise') {
        currentFilter.status = selectedCategory as StatusValue;
      } else if (selectedCategory === 'Residencial' || selectedCategory === 'Comercial') {
        // Se 'Residencial' ou 'Comercial' forem tipos de licença, o filtro principal já os cobre.
        // Se forem um status diferente, a lógica precisaria ser ajustada.
        // Por ora, assumindo que o filtro principal de licenseType é suficiente.
        // Se a categoria 'Residencial' ou 'Comercial' for para o campo 'Tipo de Licença'
        // currentFilter.licenseType = selectedCategory; // Isso já é feito pelo FilterBar
      } else if (selectedCategory === 'all') {
        // Se 'all', não aplicar filtro de status ou tipo de licença específico aqui, 
        // a menos que já esteja no `filter` principal do FilterBar.
        // Para garantir que o filtro de status seja 'all' se a categoria for 'all' e o filtro principal não especificar um status:
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
      setLoading(false);
    }
  }, [filter, searchQuery, selectedCategory, allConstructions.length, loading]); // Adicionado allConstructions.length e loading

  useEffect(() => {
    if (!loading && allConstructions.length > 0) {
        applyFilters();
    }
  }, [filter, searchQuery, selectedCategory, applyFilters, loading, allConstructions.length]);

  const handleFilterChange = (newFilter: ConstructionFilter) => {
    setFilter(newFilter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Se a categoria selecionada for um status, atualize o filtro principal de status também
    if (categoryId === 'Aprovada' || categoryId === 'Consulta' || categoryId === 'Análise') {
      setFilter(prevFilter => ({ ...prevFilter, status: categoryId as StatusValue }));
    } else if (categoryId === 'all') {
      setFilter(prevFilter => ({ ...prevFilter, status: 'all' }));
    }
    // Se for um tipo de licença, o FilterBar já deve lidar com isso ao selecionar no dropdown.
    // Se a categoria for para limpar filtros, pode ser feito aqui também.
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

  if (loading && !displayedConstructions.length && !error) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
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
      <div className="container px-4 py-6 mx-auto max-w-7xl flex-1 flex flex-col">
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
          // Passar os novos status para o FilterBar se ele tiver um seletor de status
          statusOptions={[{value: 'all', label: 'Todos Status'}, {value: 'Aprovada', label: 'Aprovada'}, {value: 'Consulta', label: 'Consulta'}, {value: 'Análise', label: 'Análise'}]}
        />

        <CategoryScroller 
          categories={categories} 
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab} 
          className="flex-1 flex flex-col mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="flex-1 min-h-[500px]">
            {loading && <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            <div className="relative h-[500px] min-h-[500px] rounded-lg overflow-hidden border">
              <Map 
                constructions={displayedConstructions} 
                onMarkerClick={handleMarkerClick}
              />
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white shadow-lg rounded-full px-4 py-2 text-sm font-medium">
                  {displayedConstructions.length} obras encontradas
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="flex-1">
            {loading && <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            {!loading && displayedConstructions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">Nenhuma obra encontrada</h3>
                <p className="text-muted-foreground mt-2">
                  Tente ajustar seus filtros ou clique abaixo para limpar todos os filtros.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={clearAllFilters}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedConstructions.map(construction => (
                    <ConstructionCard
                      key={construction.id} // Idealmente, o ID do Supabase ou um ID único do CSV
                      construction={construction}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
        
        <ConstructionDetails 
          construction={selectedConstruction}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </main>
  );
};

export default Index;

