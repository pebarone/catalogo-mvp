
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconEdit, 
  IconStar, 
  IconDelete 
} from '../../components/Icons';
import type { Product } from '../../types';
import { useMobileAnimations } from '../../hooks/useMobileAnimations';
import styles from './Admin.module.css';

interface MobileActionModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
}

export const MobileActionModal = ({ isOpen, product, onClose, onEdit, onDelete, onToggleFeatured }: MobileActionModalProps) => {
  const { spring, overlayTransition, overlayVariants, bottomSheetVariants } = useMobileAnimations();
  
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
            className={styles.bottomSheetOverlay}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={overlayTransition}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div 
                className={styles.bottomSheet}
                variants={bottomSheetVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={spring}
            >
                <div className={styles.sheetHeader}>
                    <img 
                        src={product.image_url || '/placeholder.jpg'} 
                        alt={product.name} 
                        className={styles.sheetImage}
                    />
                    <div className={styles.sheetInfo}>
                        <h3>{product.name}</h3>
                        <p>{product.category}</p>
                        <p style={{ fontWeight: 'bold', color: 'var(--color-green)', marginTop: '0.25rem' }}>
                            R$ {Number(product.price).toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className={styles.sheetActions}>
                    <button className={`${styles.sheetBtn} ${styles.edit}`} onClick={() => { onEdit(product); onClose(); }}>
                        <IconEdit size={20} />
                        Editar Produto
                    </button>
                    
                    <button className={`${styles.sheetBtn} ${styles.featured}`} onClick={() => { onToggleFeatured(product); onClose(); }}>
                        <IconStar size={20} fill={product.is_featured ? "currentColor" : "none"} />
                        {product.is_featured ? 'Remover dos Destaques' : 'Adicionar aos Destaques'}
                    </button>

                    <button className={`${styles.sheetBtn} ${styles.delete}`} onClick={() => { onDelete(product); onClose(); }}>
                        <IconDelete size={20} />
                        Excluir Produto
                    </button>

                    <button className={`${styles.sheetBtn} ${styles.cancel}`} onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
