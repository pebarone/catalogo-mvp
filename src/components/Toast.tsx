import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck, IconAlertCircle, IconClose } from './Icons';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type, duration = 5000, onClose }: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <IconCheck size={20} color="#8AC926" />;
      case 'error':
        return <IconAlertCircle size={20} color="#FF595E" />;
      case 'warning':
        return <IconAlertCircle size={20} color="#FFB627" />;
      case 'info':
        return <IconAlertCircle size={20} color="#4ECDC4" />;
      default:
        return <IconAlertCircle size={20} color="#666" />;
    }
  };

  return (
    <motion.div
      className={`${styles.toast} ${styles[type]}`}
      initial={{ opacity: 0, y: 50, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div className={styles.toastIcon}>
        {getIcon()}
      </div>
      <span className={styles.toastMessage}>{message}</span>
      <button 
        className={styles.toastClose} 
        onClick={onClose}
        aria-label="Fechar notificação"
      >
        <IconClose size={16} color="currentColor" />
      </button>
    </motion.div>
  );
};

// Container de toasts (pode ter múltiplos)
export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className={styles.toastContainer}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
