import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities } from '@/data/supabaseService';
import { Loader2, X } from 'lucide-react';

const FilterPage: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Função para gerar anos de 2010 até o ano atual
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const yearsList = [];
    for (let year = currentYear; year >= 2010; year--) {
      yearsList.push(year.toString());
    }
    return yearsList;
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setIsDataLoading(true);
      try {
        // Carregar cidades do Supabase
        const citiesData = await getCities();
        setCities(citiesData);
        
        // Gerar lista de anos
        setYears(generateYears());
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !selectedCities.includes(value)) {
      setSelectedCities([...selectedCities, value]);
    }
  };

  const handleRemoveCity = (city: string) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    // Construir query params para filtros selecionados
    const params = new URLSearchParams();
    
    // Adicionar múltiplas cidades como parâmetros separados
    selectedCities.forEach(city => {
      params.append('cities', city);
    });
    
    // Adicionar ano se selecionado
    if (selectedYear) {
      params.append('year', selectedYear);
    }
    
    // Navegar para a página principal com os filtros como query params
    const queryString = params.toString();
    navigate(`/${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Filtrar Licenças Ambientais</h1>
        <p className="text-gray-600">Selecione os critérios abaixo para encontrar as licenças desejadas.</p>
      </header>

      <main className="max-w-2xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg">
        {isDataLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando opções de filtro...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidades</label>
              <select
                id="city"
                name="city"
                value=""
                onChange={handleCityChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Selecione uma cidade</option>
                {cities
                  .filter(city => !selectedCities.includes(city))
                  .map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))
                }
              </select>
              
              {/* Exibir cidades selecionadas como tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCities.map(city => (
                  <div 
                    key={city} 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    {city}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCity(city)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {selectedCities.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedCities.length} {selectedCities.length === 1 ? 'cidade selecionada' : 'cidades selecionadas'}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="emissionYear" className="block text-sm font-medium text-gray-700 mb-1">Ano de Emissão</label>
              <select
                id="emissionYear"
                name="emissionYear"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Selecione um ano</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading || (selectedCities.length === 0 && !selectedYear)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Aplicando filtros...
                  </>
                ) : (
                  'Aplicar Filtros e Ver Resultados'
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default FilterPage;

