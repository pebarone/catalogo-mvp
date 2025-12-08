import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import styles from './Products.module.css';

const allCategories = ['Todos', ...new Set(products.map(p => p.category))];

export const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

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
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.categoryTag}>{product.category}</span>
                <h3>{product.name}</h3>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>R$ {product.price.toFixed(2)}</span>
                  <span className={styles.viewBtn}>Ver Detalhes</span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};
