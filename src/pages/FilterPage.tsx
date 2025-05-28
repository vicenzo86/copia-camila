import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities, getLicenseTypes } from '@/data/supabaseService';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const FilterPage: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>(['Aprovada', 'Análise', 'Consulta']);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
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
        
        // Opções de status já definidas no estado inicial
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    // Construir query params para filtros selecionados
    const params = new URLSearchParams();
    
    if (selectedCity) {
      params.append('city', selectedCity);
    }
    
    if (selectedYear) {
      params.append('year', selectedYear);
    }
    
    if (selectedStatus) {
      params.append('status', selectedStatus);
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
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <select
                id="city"
                name="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
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

            <div className="mb-6">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Selecione um status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
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

