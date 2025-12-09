import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import type { Product } from '../services/api';
import styles from './Products.module.css';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Extrair categorias únicas dos produtos
  const allCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(categories)];
  }, [products]);

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Nossa Coleção</h1>
        <p>Escolha o acessório perfeito para brilhar!</p>
      </div>

      <div className={styles.categories}>
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={`${styles.catButton} ${selectedCategory === cat ? styles.active : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : filteredProducts.length > 0 ? (
        <motion.div 
          layout
          className={styles.grid}
        >
          {filteredProducts.map((product) => (
            <Link to={`/produto/${product.id}`} key={product.id} className={styles.cardLink}>
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -5 }}
                className={styles.card}
              >
                <div className={styles.cardImageWrapper}>
                  <img src={product.image_url || '/placeholder.jpg'} alt={product.name} loading="lazy" />
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.categoryTag}>{product.category}</span>
                  <h3>{product.name}</h3>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>R$ {Number(product.price || 0).toFixed(2)}</span>
                    <span className={styles.viewBtn}>Ver Detalhes</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      ) : (
        <div className={styles.emptyState}>
          <h3>Nenhum produto encontrado</h3>
          <p>Não há produtos disponíveis {selectedCategory !== 'Todos' ? `na categoria "${selectedCategory}"` : 'no momento'}.</p>
        </div>
      )}
    </div>
  );
};
