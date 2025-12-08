import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import styles from './Home.module.css';
import { products } from '../data/products';

export const Home = () => {
  const featuredProducts = products.slice(0, 3);

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
              Ver Coleção <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        <div className={styles.heroVisual}>
           <div className={styles.blob1}></div>
           <div className={styles.blob2}></div>
           <div className={styles.blob3}></div>
           <img 
             src="/produto1.jpg" 
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
          {featuredProducts.map((product) => (
            <Link to={`/produto/${product.id}`} key={product.id} className={styles.cardLink}>
              <motion.div 
                whileHover={{ y: -10 }}
                className={styles.card}
              >
                <div className={styles.cardImageWrapper}>
                  <img src={product.image} alt={product.name} className={styles.cardImage} />
                </div>
                <div className={styles.cardContent}>
                  <h3>{product.name}</h3>
                  <p className={styles.price}>R$ {product.price.toFixed(2)}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
