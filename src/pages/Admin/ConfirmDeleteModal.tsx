
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { IconAlert } from '../../components/Icons';
import { useMobileAnimations } from '../../hooks/useMobileAnimations';
import styles from './Admin.module.css';

interface ConfirmDeleteProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const ConfirmDeleteModal = ({ isOpen, productName, onClose, onConfirm, isDeleting }: ConfirmDeleteProps) => {
  const { spring, overlayTransition, modalVariants, overlayVariants } = useMobileAnimations();
  
  // Prevenir scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={overlayTransition}
        >
          <motion.div
            className={styles.confirmModal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={spring}
          >
            <IconAlert size={48} color="#FF595E" />
            <h3>Excluir Produto</h3>
            <p>Tem certeza que deseja excluir <strong>"{productName}"</strong>? Esta ação não pode ser desfeita.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={onClose} disabled={isDeleting}>
                Cancelar
              </button>
              <button className={styles.deleteBtn} onClick={onConfirm} disabled={isDeleting}>
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
