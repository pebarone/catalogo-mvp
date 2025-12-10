import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { productsApi, favoritesApi } from '../services/api';
import type { Product } from '../services/api';
import styles from './Products.module.css';
import { getSubcategoryColor } from '../utils/subcategoryColors';
import { useAuth } from '../contexts/AuthContext';
import { IconHeart } from '../components/Icons';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';

export const Products = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          maxResults: itemsPerPage,
          page: currentPage,
        };

        if (selectedCategory !== 'Todos') {
          params.category = selectedCategory;
        }

        if (selectedSubcategory) {
          params.subcategory = selectedSubcategory;
        }

        const data = await productsApi.getAll(params);
        setProducts(data.products);
        setTotalProducts(data.total);

        // Carregar favoritos se autenticado
        if (isAuthenticated) {
          try {
            const favs = await favoritesApi.getAll();
            setFavorites(new Set(favs.map((f: any) => f.product_id)));
          } catch {
            // Ignora erro de favoritos
          }
        } else {
          setFavorites(new Set());
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, selectedCategory, selectedSubcategory, itemsPerPage, isAuthenticated]);

  // Extrair categorias e subcategorias únicas dos produtos
  const allCategories = useMemo(() => {
    // Buscar todas as categorias da API (sem filtro)
    const categories = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(categories)];
  }, [products]);

  const subcategories = useMemo(() => {
    if (selectedCategory === 'Todos') return [];
    
    const subs = new Set(
      products
        .filter(p => p.category === selectedCategory && p.subcategory)
        .map(p => p.subcategory!)
    );
    return Array.from(subs);
  }, [products, selectedCategory]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handleFavoriteToggle = async (productId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      if (favorites.has(productId)) {
        await favoritesApi.remove(productId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await favoritesApi.add(productId);
        setFavorites(prev => new Set(prev).add(productId));
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (subcategory: string | null) => {
    setSelectedSubcategory(subcategory);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Nossa Coleção</h1>
        <p>Escolha o acessório perfeito para brilhar!</p>
        <div className={styles.productsCount}>
          {totalProducts} produto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filtros de Categoria */}
      <div className={styles.categories}>
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={`${styles.catButton} ${selectedCategory === cat ? styles.active : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filtros de Subcategoria */}
      {subcategories.length > 0 && (
        <div className={styles.subcategories}>
          <button
            className={`${styles.subButton} ${!selectedSubcategory ? styles.active : ''}`}
            onClick={() => handleSubcategoryChange(null)}
          >
            Todas
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              className={`${styles.subButton} ${selectedSubcategory === sub ? styles.active : ''}`}
              onClick={() => handleSubcategoryChange(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Seletor de itens por página */}
      <div className={styles.controls}>
        <div className={styles.itemsPerPageSelector}>
          <label>Mostrar:</label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>por página</span>
        </div>
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className={styles.grid}>
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className={styles.cardSkeleton}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonBadge}></div>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonPrice}></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <motion.div 
            layout
            className={styles.grid}
          >
            {products.map((product) => (
              <div key={product.id} className={styles.cardWrapper}>
                <Link to={`/produto/${product.id}`} className={styles.cardLink}>
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ y: -5 }}
                    className={styles.card}
                  >
                    {/* Badge de destaque */}
                    {product.is_featured && (
                      <div className={styles.featuredBadge}>⭐ Destaque</div>
                    )}
                    
                    <div className={styles.cardImageWrapper}>
                      <img src={product.image_url || '/placeholder.jpg'} alt={product.name} loading="lazy" />
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.categoryTag}>{product.category}</span>
                      {product.subcategory && (
                        <span 
                          className={styles.subcategoryTag}
                          style={{
                            backgroundColor: getSubcategoryColor(product.subcategory).bg,
                            color: getSubcategoryColor(product.subcategory).text,
                          }}
                        >
                          {product.subcategory}
                        </span>
                      )}
                      <h3>{product.name}</h3>
                      <div className={styles.cardFooter}>
                        <span className={styles.price}>R$ {Number(product.price || 0).toFixed(2)}</span>
                        <span className={styles.viewBtn}>Ver Detalhes</span>
                      </div>
                    </div>
                    
                    {/* Botão de favorito no footer */}
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.favoriteBtn} ${favorites.has(product.id) ? styles.favoriteActive : ''}`}
                        onClick={(e) => handleFavoriteToggle(product.id, e)}
                        title={favorites.has(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        aria-label={favorites.has(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <IconHeart
                          size={24}
                          fill={favorites.has(product.id) ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </motion.div>
                </Link>
              </div>
            ))}
          </motion.div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>

              <div className={styles.pageNumbers}>
                {getPaginationRange().map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className={styles.pageDots}>...</span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => handlePageChange(page as number)}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <h3>Nenhum produto encontrado</h3>
          <p>Não há produtos disponíveis {selectedCategory !== 'Todos' ? `na categoria "${selectedCategory}"` : 'no momento'}.</p>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
};
