import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi, type CategoryInfo } from '../services/api';

export type SortOption = 'default' | 'name-asc' | 'price-asc' | 'price-desc';

export interface UseProductFiltersReturn {
  // Dados de categorias
  categories: CategoryInfo[];
  isLoadingCategories: boolean;
  
  // Estado de filtros
  selectedCategory: string | null;
  selectedSubcategories: string[];
  sortBy: SortOption;
  
  // Paginação
  currentPage: number;
  itemsPerPage: number;
  
  // Actions
  setCategory: (category: string | null) => void;
  toggleSubcategory: (subcategory: string) => void;
  setSortBy: (sort: SortOption) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  clearFilters: () => void;
  
  // Helpers
  getAvailableSubcategories: () => string[];
  getCategoryCount: (category: string) => number;
  getTotalProductCount: () => number;
  hasActiveFilters: boolean;
}

/**
 * Hook para gerenciar estado de filtros de produtos
 * Sincroniza estado com URL query parameters para persistência
 */
export function useProductFilters(): UseProductFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado de categorias (sempre local, pois é dado do servidor)
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Estado derivado dos search params
  const selectedCategory = searchParams.get('category');
  
  const selectedSubcategories = useMemo(() => {
    const sub = searchParams.get('subcategories');
    return sub ? sub.split(',') : [];
  }, [searchParams]);

  const sortBy = (searchParams.get('sort') as SortOption) || 'default';
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const itemsPerPage = Number(searchParams.get('limit')) || 6;

  // Carregar categorias do endpoint dedicado
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await productsApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);

  // Helpers para atualizar URL
  const updateParams = useCallback((newParams: Record<string, string | null>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      return next;
    });
  }, [setSearchParams]);

  // Actions
  const setCategory = useCallback((category: string | null) => {
    updateParams({
      category,
      subcategories: null, // Limpa subcategorias ao mudar categoria
      page: '1' // Reseta página
    });
  }, [updateParams]);

  const toggleSubcategory = useCallback((subcategory: string) => {
    const currentSubs = selectedSubcategories;
    let newSubs: string[];
    
    if (currentSubs.includes(subcategory)) {
      newSubs = currentSubs.filter(s => s !== subcategory);
    } else {
      newSubs = [...currentSubs, subcategory];
    }
    
    updateParams({
      subcategories: newSubs.length > 0 ? newSubs.join(',') : null,
      page: '1'
    });
  }, [selectedSubcategories, updateParams]);

  const handleSetSortBy = useCallback((sort: SortOption) => {
    updateParams({
      sort: sort === 'default' ? null : sort,
      page: '1'
    });
  }, [updateParams]);

  const handleSetCurrentPage = useCallback((page: number) => {
    updateParams({ page: page.toString() });
  }, [updateParams]);

  const handleSetItemsPerPage = useCallback((count: number) => {
    updateParams({
      limit: count.toString(),
      page: '1'
    });
  }, [updateParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams();
      // Mantém apenas itemsPerPage se desejar, ou limpa tudo para default
      if (prev.has('limit')) next.set('limit', prev.get('limit')!);
      return next;
    });
  }, [setSearchParams]);

  // Helpers de dados
  const getAvailableSubcategories = useCallback((): string[] => {
    if (selectedCategory) {
      const found = categories.find(c => c.category === selectedCategory);
      return found?.subcategories || [];
    }
    
    const allSubcategories = new Set<string>();
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => allSubcategories.add(sub));
    });
    return Array.from(allSubcategories).sort();
  }, [categories, selectedCategory]);

  const getCategoryCount = useCallback((category: string): number => {
    const found = categories.find(c => c.category === category);
    return found?.productCount || 0;
  }, [categories]);

  const getTotalProductCount = useCallback((): number => {
    return categories.reduce((sum, cat) => sum + cat.productCount, 0);
  }, [categories]);

  const hasActiveFilters = useMemo(() => {
    return selectedCategory !== null || selectedSubcategories.length > 0 || sortBy !== 'default';
  }, [selectedCategory, selectedSubcategories, sortBy]);

  return {
    categories,
    isLoadingCategories,
    selectedCategory,
    selectedSubcategories,
    sortBy,
    currentPage,
    itemsPerPage,
    setCategory,
    toggleSubcategory,
    setSortBy: handleSetSortBy,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    clearFilters,
    getAvailableSubcategories,
    getCategoryCount,
    getTotalProductCount,
    hasActiveFilters,
  };
}

export default useProductFilters;
