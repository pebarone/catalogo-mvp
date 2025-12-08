import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Heart } from 'lucide-react';
import { products } from '../data/products';
import styles from './ProductDetails.module.css';

export const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return <div className={styles.notFound}>Produto não encontrado!</div>;
  }

  // WhatsApp link generator
  const waMessage = `Olá! Adorei o produto "${product.name}" e gostaria de saber mais.`;
  const waLink = `https://wa.me/5511972969552?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className={styles.container}>
      <Link to="/produtos" className={styles.backLink}>
        <ArrowLeft size={20} /> Voltar para produtos
      </Link>

      <div className={styles.grid}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={styles.imageWrapper}
        >
          <img src={product.image} alt={product.name} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.info}
        >
          <span className={styles.category}>{product.category}</span>
          <h1>{product.name}</h1>
          <div className={styles.price}>R$ {product.price.toFixed(2)}</div>
          
          <p className={styles.description}>
            {product.description}
          </p>

          <div className={styles.actions}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.buyButton}>
              <MessageCircle size={20} />
              Eu quero!
            </a>
            <button className={styles.wishlistButton}>
              <Heart size={24} />
            </button>
          </div>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              Feito à mão
            </div>
            <div className={styles.featureItem}>
              🌈 Peça única
            </div>
            <div className={styles.featureItem}>
              🇧🇷 Envio para todo Brasil
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
