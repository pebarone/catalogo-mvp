
import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconDashboard, 
  IconAdd, 
  IconPackage, 
  IconTag, 
  IconHistory, 
  IconSearch, 
  IconEdit, 
  IconDelete, 
  IconStar,
  IconCheck
} from '../../components/Icons';
import { productsApi, ApiError } from '../../services/api';
import type { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { getSubcategoryColor } from '../../utils/subcategoryColors';
import styles from './Admin.module.css';

// Componentes extraídos
import { ProductModal } from './ProductModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { BulkProductModal } from './BulkProductModal';
import { MobileActionModal } from './MobileActionModal';

// Componente principal Admin
export const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  // We keep a separate state for categories/subcategories options
  const [filterOptions, setFilterOptions] = useState<{categories: string[], subcategories: string[]}>({ categories: [], subcategories: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Search State with Transition
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(''); // Immediate input state
  const [searchQuery, setSearchQuery] = useState(''); // Deferred search state
  
  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | 'featured'; direction: 'asc' | 'desc' } | null>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Statistics State
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    recentCount: 0,
    featuredCount: 0
  });

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null); // For single delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkProductModalOpen, setIsBulkProductModalOpen] = useState(false);
  const [mobileActionProduct, setMobileActionProduct] = useState<Product | null>(null);
  
  // Selection Mode (Long Press) Ref
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const startPress = (id: string) => {
    isLongPress.current = false;
    longPressTimeout.current = setTimeout(() => {
      isLongPress.current = true;
      handleSelectOne(id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const cancelPress = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
  };
  
  const toast = useToast();

  // Redirecionar se não for admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  // Carregar opções de filtro e estatísticas
  useEffect(() => {
    const loadData = async () => {
      try {
        // Busca 1000 itens para filtros e estatísticas
        const data = await productsApi.getAll({ maxResults: 1000 }); 
        const categories = new Set<string>();
        const subcategories = new Set<string>();
        let recent = 0;
        let featured = 0;
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        data.products.forEach(p => {
          if (p.category) categories.add(p.category);
          if (p.subcategory) subcategories.add(p.subcategory);
          if (p.is_featured) featured++;
          if (p.created_at && new Date(p.created_at) > weekAgo) recent++;
        });
        
        setFilterOptions({
          categories: Array.from(categories).sort(),
          subcategories: Array.from(subcategories).sort()
        });

        setStats({
          productsCount: data.total || data.products.length,
          categoriesCount: categories.size,
          recentCount: recent,
          featuredCount: featured
        });
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
      }
    };
    loadData();
  }, [products]); 

  // Carregar produtos com filtros e paginação
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        maxResults: itemsPerPage
      };

      if (selectedCategory) params.category = selectedCategory;
      if (selectedSubcategory) params.subcategory = selectedSubcategory;

      const data = await productsApi.getAll(params);
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedCategory, selectedSubcategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Sorting Logic
  const handleSort = (key: keyof Product | 'featured') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let aValue: any = a[key as keyof Product];
    let bValue: any = b[key as keyof Product];
    if (key === 'featured') {
      aValue = a.is_featured ? 1 : 0;
      bValue = b.is_featured ? 1 : 0;
    }
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const displayedProducts = sortedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(selectedIds);
      displayedProducts.forEach(p => newSelected.add(p.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      displayedProducts.forEach(p => newSelected.delete(p.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        return newSelected;
    });
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      await productsApi.deleteBulk(idsToDelete);
      toast.success(`${idsToDelete.length} produtos excluídos com sucesso!`);
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error('Erro ao excluir produtos em massa');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Single Delete
  const handleDeleteProduct = async () => {
     if (!deleteProduct) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(deleteProduct.id);
      toast.success('Produto excluído com sucesso!');
      setDeleteProduct(null);
      setSelectedIds(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(deleteProduct.id)) {
            newSelected.delete(deleteProduct.id);
        }
        return newSelected;
      });
      loadProducts();
    } catch (err) {
        toast.error('Erro ao excluir produto');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save/Edit/Toggle logic
  const handleSaveProduct = async (formData: FormData, isEdit: boolean) => {
    try {
      if (isEdit && editingProduct) {
        await productsApi.update(editingProduct.id, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productsApi.create(formData);
        toast.success('Produto criado com sucesso!');
      }
      loadProducts();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao salvar produto');
      }
      throw err;
    }
  };

  const handleBulkSave = async (formData: FormData) => {
    try {
      const result = await productsApi.createBulk(formData);
      toast.success(result.message || `${result.createdCount} produtos criados!`);
      loadProducts();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao criar produtos em massa');
      }
      throw err;
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const newFeaturedState = !product.is_featured;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: newFeaturedState } : p));
    try {
      await productsApi.toggleFeatured(product.id, newFeaturedState);
      // Update stats count locally
      setStats(prev => ({
          ...prev,
          featuredCount: newFeaturedState ? prev.featuredCount + 1 : prev.featuredCount - 1
      }));
      toast.success(newFeaturedState ? 'Adicionado aos destaques!' : 'Removido dos destaques');
    } catch (err) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: !newFeaturedState } : p));
      if (err instanceof ApiError && err.code === 'FEATURED_LIMIT_REACHED') {
          toast.error('Limite de destaques atingido! (Max 6)');
      } else {
          toast.error('Erro ao alterar destaque');
      }
    }
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <IconDashboard size={28} color="#6A4C93" />
          <h1>Administração</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <motion.button
            className={styles.addBtn}
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconAdd size={20} color="white" />
            Adicionar Produto
          </motion.button>
          <motion.button
            className={styles.addBtn}
            style={{ backgroundColor: '#4267AC' }}
            onClick={() => setIsBulkProductModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconAdd size={20} color="white" />
            Adicionar Vários
          </motion.button>
        </div>
      </div>

      <div className={styles.stats}>
        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={`${styles.statIcon} ${styles.products}`}>
            <IconPackage size={24} color="#4267AC" />
          </div>
          <div className={styles.statInfo}>
            <h3>{totalProducts}</h3>
            <p>Total de Produtos</p>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={`${styles.statIcon} ${styles.categories}`}>
            <IconTag size={24} color="#8AC926" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.categoriesCount}</h3>
            <p>Categorias</p>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={`${styles.statIcon} ${styles.recent}`}>
            <IconHistory size={24} color="#6A4C93" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.recentCount}</h3>
            <p>Adicionados esta semana</p>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={`${styles.statIcon} ${styles.featured}`}>
            <IconStar size={24} color="#ff9800" fill="#ff9800" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.featuredCount}/6</h3>
            <p>Produtos em Destaque</p>
          </div>
        </motion.div>
      </div>

      {/* Products Table Wrapper */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h2>Gerenciar Produtos</h2>
          <div className={styles.searchWrapper}>
            <IconSearch size={18} color="#999" />
            <input
              type="text"
              placeholder="Buscar na página..."
              value={searchValue}
              onChange={handleSearchChange}
            />
            {isPending && (
                <div style={{ 
                    width: 16, 
                    height: 16, 
                    border: '2px solid #6A4C93', 
                    borderTopColor: 'transparent', 
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginLeft: 8
                }} />
            )}
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className={styles.filterBar}>
            <select 
              className={styles.filterSelect}
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todas as Categorias</option>
              {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className={styles.filterSelect}
              value={selectedSubcategory}
              onChange={(e) => { setSelectedSubcategory(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todas as Subcategorias</option>
              {filterOptions.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div 
              className={styles.bulkActions}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <span>{selectedIds.size} produtos selecionados</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button
                  className={styles.bulkDeleteBtn}
                  style={{ background: '#6A4C93' }}
                  onClick={() => {
                    const allSelected = displayedProducts.every(p => selectedIds.has(p.id));
                    if (allSelected) {
                      const newSelected = new Set(selectedIds);
                      displayedProducts.forEach(p => newSelected.delete(p.id));
                      setSelectedIds(newSelected);
                    } else {
                      const newSelected = new Set(selectedIds);
                      displayedProducts.forEach(p => newSelected.add(p.id));
                      setSelectedIds(newSelected);
                    }
                  }}
                >
                  <span style={{display:'inline-flex', marginRight: 6}}>
                    <IconCheck size={16} color="white" />
                  </span>
                  {displayedProducts.length > 0 && displayedProducts.every(p => selectedIds.has(p.id)) ? 'Deselecionar' : 'Todos'}
                </button>

                <button 
                  className={styles.bulkDeleteBtn}
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                >
                  <span style={{display:'inline-flex', marginRight: 6}}>
                    <IconDelete size={16} color="white" />
                  </span>
                  Excluir
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className={styles.loading}>
            <motion.div 
              className={styles.loadingSpinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p>Carregando produtos...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <IconPackage size={64} color="#ccc" />
            <h3>Nenhum produto encontrado</h3>
          </div>
        ) : (
          <>
            <div className={styles.desktopTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox}
                      checked={displayedProducts.length > 0 && displayedProducts.every(p => selectedIds.has(p.id))}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className={styles.sortableHeader}>
                    <div className={styles.headerContent}>
                      PRODUTO {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('category')} className={styles.sortableHeader}>
                    <div className={styles.headerContent}>
                      CATEGORIA {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('price')} className={styles.sortableHeader}>
                    <div className={styles.headerContent}>
                      PREÇO {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('featured')} className={styles.sortableHeader}>
                    <div className={styles.headerContent}>
                      DESTAQUE {sortConfig?.key === 'featured' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {displayedProducts.map((product) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ background: selectedIds.has(product.id) ? '#fff5f5' : undefined }}
                  >
                    <td>
                      <input 
                        type="checkbox" 
                        className={styles.checkbox}
                        checked={selectedIds.has(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={product.image_url || '/placeholder.jpg'}
                          alt={product.name}
                          className={styles.productImage}
                        />
                        <div className={styles.productInfo}>
                          <h4>{product.name}</h4>
                          {product.subcategory && (
                            <span 
                              className={styles.subcategoryBadge}
                              style={{
                                backgroundColor: getSubcategoryColor(product.subcategory).bg,
                                color: getSubcategoryColor(product.subcategory).text,
                              }}
                            >
                              {product.subcategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.categoryBadge}>{product.category}</span></td>
                    <td><span className={styles.price}>R$ {Number(product.price || 0).toFixed(2)}</span></td>
                    <td>
                      <label className={styles.toggleSwitch}>
                        <input
                          type="checkbox"
                          checked={product.is_featured || false}
                          onChange={() => handleToggleFeatured(product)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <motion.button
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductModalOpen(true);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconEdit size={20} className={styles.icon} />
                        </motion.button>
                        <motion.button
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => setDeleteProduct(product)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconDelete size={20} className={styles.icon} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
            </div>

            {/* Mobile List View */}
            <div className={styles.mobileList}>
              {displayedProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  className={styles.mobileListItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    border: selectedIds.has(product.id) ? '2px solid #6A4C93' : '1px solid #eee',
                    background: selectedIds.has(product.id) ? '#f3f0f7' : 'white'
                  }}
                  onPointerDown={() => startPress(product.id)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onClick={() => {
                    if (isLongPress.current) return;
                    
                    if (selectedIds.size > 0) {
                      handleSelectOne(product.id);
                    } else {
                      setMobileActionProduct(product);
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={product.image_url || '/placeholder.jpg'} 
                      alt={product.name} 
                      className={styles.mobileProductImage}
                    />
                    {selectedIds.has(product.id) && (
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        background: '#6A4C93',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.mobileProductInfo}>
                    <div className={styles.mobileProductHeader}>
                      <h4 className={styles.mobileProductName}>{product.name}</h4>
                      <span className={styles.mobileProductPrice}>R$ {Number(product.price).toFixed(2)}</span>
                    </div>
                    <div className={styles.mobileProductMeta}>
                       <span className={styles.categoryBadge} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{product.category}</span>
                       {product.is_featured && (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ff9800', fontSize: '0.75rem', fontWeight: 600 }}>
                           <IconStar size={12} fill="#ff9800" color="#ff9800" />
                           Destaque
                         </span>
                       )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className={styles.pagination}>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages || 1}
              </span>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteProduct}
        productName={deleteProduct?.name || ''}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDeleteProduct}
        isDeleting={isDeleting}
      />

      <ConfirmDeleteModal
        isOpen={isBulkDeleteModalOpen}
        productName={`${selectedIds.size} produtos selecionados`}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
      />

      <BulkProductModal
        isOpen={isBulkProductModalOpen}
        onClose={() => setIsBulkProductModalOpen(false)}
        onSave={handleBulkSave}
      />

      <MobileActionModal
        isOpen={!!mobileActionProduct}
        product={mobileActionProduct}
        onClose={() => setMobileActionProduct(null)}
        onEdit={(p) => {
            setEditingProduct(p);
            setIsProductModalOpen(true);
        }}
        onDelete={(p) => setDeleteProduct(p)}
        onToggleFeatured={handleToggleFeatured}
      />

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

