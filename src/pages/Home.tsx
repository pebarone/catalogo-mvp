import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconArrowRight } from '../components/Icons';
import styles from './Home.module.css';
import { productsApi } from '../services/api';
import type { Product } from '../services/api';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await productsApi.getAll();
        setFeaturedProducts(products.slice(0, 3));
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={styles.title}
          >
        Colorindo<br />
            <span className={styles.gradientText}>Sonhos</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.subtitle}
          >
            Acessórios feitos à mão com muito amor e cor para alegrar o seu dia! 🌈
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/produtos" className={styles.ctaButton}>
              Ver Coleção <IconArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        <div className={styles.heroVisual}>
           <div className={styles.blob1}></div>
           <div className={styles.blob2}></div>
           <div className={styles.blob3}></div>
           <img 
             src={"/produto3.jpg"} 
             alt="Acessórios Coloridos" 
             className={styles.heroImage}
           />
        </div>
      </section>

      {/* Featured Section */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <h2>Destaques da Semana</h2>
          <Link to="/produtos" className={styles.seeAll}>Ver tudo</Link>
        </div>
        
        <div className={styles.grid}>
          {isLoading ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <div key={i} className={styles.cardSkeleton}>
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonPrice}></div>
                </div>
              </div>
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <Link to={`/produto/${product.id}`} key={product.id} className={styles.cardLink}>
                <motion.div 
                  whileHover={{ y: -10 }}
                  className={styles.card}
                >
                  <div className={styles.cardImageWrapper}>
                    <img src={product.image_url || '/placeholder.jpg'} alt={product.name} className={styles.cardImage} />
                  </div>
                  <div className={styles.cardContent}>
                    <h3>{product.name}</h3>
                    <p className={styles.price}>R$ {Number(product.price || 0).toFixed(2)}</p>
                  </div>
                </motion.div>
              </Link>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Nenhum produto disponível no momento.</p>
              <Link to="/contato" className={styles.ctaButton}>Entre em Contato</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
