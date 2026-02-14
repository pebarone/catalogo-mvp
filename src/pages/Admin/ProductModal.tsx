
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconAdd, 
  IconTag, 
  IconPackage, 
  IconEdit, 
  IconUpload,
  IconCamera
} from '../../components/Icons';
import { productsApi } from '../../services/api';
import type { Product } from '../../types';
import { useMobileAnimations } from '../../hooks/useMobileAnimations';
import styles from './Admin.module.css';
import modalStyles from '../../components/LoginModal/LoginModal.module.css';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (formData: FormData, isEdit: boolean) => Promise<void>;
}

export const ProductModal = ({ isOpen, product, onClose, onSave }: ProductModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingSubcategories, setExistingSubcategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  
  const { spring, overlayTransition, modalVariants, overlayVariants } = useMobileAnimations();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setCategory(product.category);
      setSubcategory(product.subcategory || '');
      setImagePreview(product.image_url);
    } else {
      setName('');
      setPrice('');
      setCategory('');
      setSubcategory('');
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  // Carregar categorias e subcategorias existentes
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const data = await productsApi.getAll({ maxResults: 1000 });
        const categories = new Set<string>();
        const subcategories = new Set<string>();
        
        data.products.forEach(p => {
          if (p.category) categories.add(p.category);
          if (p.subcategory) subcategories.add(p.subcategory);
        });
        
        setExistingCategories(Array.from(categories).sort());
        setExistingSubcategories(Array.from(subcategories).sort());
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    
    if (isOpen) {
      loadExistingData();
    }
  }, [isOpen]);

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

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', category);
      if (subcategory.trim()) {
        formData.append('subcategory', subcategory.trim());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await onSave(formData, !!product);
      onClose();
    } catch {
      // Erro tratado no componente pai
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={modalStyles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={overlayTransition}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={modalStyles.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={spring}
          >
            <button
              className={modalStyles.closeBtn}
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <img src="/closeicon.svg" alt="Fechar" width={24} height={24} />
            </button>

            <div className={modalStyles.modalContent}>
              <div className={modalStyles.header}>
                <div className={modalStyles.iconWrapper}>
                  {product ? <IconEdit size={32} color="#6A4C93" /> : <IconAdd size={32} color="#6A4C93" />}
                </div>
                <h2>{product ? 'Editar Produto' : 'Novo Produto'}</h2>
                <p>{product ? 'Atualize as informações do produto' : 'Preencha os dados para criar um novo produto'}</p>
              </div>

              <form className={modalStyles.form} onSubmit={handleSubmit}>
                <div className={modalStyles.inputGroup}>
                  <label>Nome do Produto</label>
                  <div className={modalStyles.inputWrapper}>
                    <IconTag size={18} color="#999" className={modalStyles.inputIcon} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Pulseira Arco-Íris"
                      required
                    />
                  </div>
                </div>

                <div className={modalStyles.inputGroup}>
                  <label>Preço (R$)</label>
                  <div className={modalStyles.inputWrapper}>
                    <span className={modalStyles.inputIcon} style={{ fontSize: '14px', fontWeight: 'bold', top: '50%', transform: 'translateY(-50%)' }}>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className={modalStyles.inputGroup}>
                  <label>Categoria</label>
                  <div className={styles.customSelect}>
                    <div className={modalStyles.inputWrapper}>
                      <IconPackage size={18} color="#999" className={modalStyles.inputIcon} />
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onFocus={() => setShowCategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                        placeholder="Selecione ou digite"
                        required
                      />
                    </div>
                    <AnimatePresence>
                      {showCategoryDropdown && existingCategories.length > 0 && (
                        <motion.div 
                          className={styles.dropdown} 
                          style={{ top: '100%', zIndex: 10 }}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {existingCategories
                            .filter(cat => cat.toLowerCase().includes(category.toLowerCase()))
                            .map(cat => (
                              <div
                                key={cat}
                                className={styles.dropdownItem}
                                onMouseDown={() => setCategory(cat)}
                              >
                                {cat}
                              </div>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className={modalStyles.inputGroup}>
                  <label>Subcategoria (Opcional)</label>
                  <div className={styles.customSelect}>
                    <div className={modalStyles.inputWrapper}>
                      <IconPackage size={18} color="#999" className={modalStyles.inputIcon} />
                      <input
                        type="text"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        onFocus={() => setShowSubcategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSubcategoryDropdown(false), 200)}
                        placeholder="Selecione ou digite"
                      />
                    </div>
                    <AnimatePresence>
                      {showSubcategoryDropdown && existingSubcategories.length > 0 && (
                        <motion.div 
                          className={styles.dropdown} 
                          style={{ top: '100%', zIndex: 10 }}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {existingSubcategories
                            .filter(sub => sub.toLowerCase().includes(subcategory.toLowerCase()))
                            .map(sub => (
                              <div
                                key={sub}
                                className={styles.dropdownItem}
                                onMouseDown={() => setSubcategory(sub)}
                              >
                                {sub}
                              </div>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className={modalStyles.inputGroup}>
                  <label>Imagem</label>
                  <div style={{ minHeight: '150px', marginTop: '0.5rem', contain: 'layout style' }}>
                    {imagePreview ? (
                      <div key="image-preview" className={styles.imagePreview}>
                        <img src={imagePreview} alt="Preview" />
                        <button
                          type="button"
                          className={styles.removeImage}
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          aria-label="Remover imagem"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div key="upload-options" className={styles.uploadOptions} style={{ display: 'flex', gap: '1rem' }}>
                        <label className={styles.imageUpload} style={{ background: 'white', flex: 1, cursor: 'pointer' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                          />
                          <IconUpload size={32} color="#999" />
                          <p>Abrir <span>Galeria</span></p>
                        </label>
                        
                        <label className={styles.imageUpload} style={{ background: 'white', flex: 1, cursor: 'pointer' }}>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                          />
                          <IconCamera size={32} color="#999" />
                          <p>Tirar <span>Foto</span></p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className={modalStyles.submitBtn}
                  disabled={isSubmitting || !name || !price || !category}
                >
                  {isSubmitting ? 'Salvando...' : product ? 'Atualizar Produto' : 'Criar Produto'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={modalStyles.switchLink}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
