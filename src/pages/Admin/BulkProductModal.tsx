
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconAdd, 
  IconDelete, 
  IconUpload, 
  IconTag, 
  IconPackage 
} from '../../components/Icons';
import { productsApi } from '../../services/api';
import { useMobileAnimations } from '../../hooks/useMobileAnimations';
import styles from './Admin.module.css';
import modalStyles from '../../components/LoginModal/LoginModal.module.css';

interface BulkProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

export const BulkProductModal = ({ isOpen, onClose, onSave }: BulkProductModalProps) => {
  const [drafts, setDrafts] = useState<Array<{
    id: number;
    name: string;
    price: string;
    category: string;
    subcategory: string;
    imageFile: File | null;
    imagePreview: string | null;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingSubcategories, setExistingSubcategories] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<{index: number, type: 'category' | 'subcategory'} | null>(null);
  
  const { spring, overlayTransition, modalVariants, overlayVariants } = useMobileAnimations();

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
      if (drafts.length === 0) {
        addDraft();
      }
    }
  }, [isOpen]);

  const addDraft = () => {
    setDrafts(prev => [...prev, {
      id: Date.now(),
      name: '',
      price: '',
      category: '',
      subcategory: '',
      imageFile: null,
      imagePreview: null
    }]);
  };

  const removeDraft = (id: number) => {
    if (drafts.length > 1) {
      setDrafts(prev => prev.filter(d => d.id !== id));
    }
  };

  const updateDraft = (id: number, field: string, value: any) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleImageChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateDraft(id, 'imageFile', file);
      updateDraft(id, 'imagePreview', URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (drafts.some(d => !d.name || !d.price || !d.category || !d.imageFile)) {
      alert('Preencha todos os campos obrigatórios e adicione imagens para todos os produtos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const productsData = drafts.map(d => ({
        name: d.name,
        price: parseFloat(d.price),
        category: d.category,
        subcategory: d.subcategory,
        is_featured: false
      }));

      formData.append('products', JSON.stringify(productsData));
      
      drafts.forEach(d => {
        if (d.imageFile) {
          formData.append('images', d.imageFile);
        }
      });

      await onSave(formData);
      setDrafts([]);
      onClose();
    } catch (err) {
      console.error(err);
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
        >
          <motion.div
            className={modalStyles.modal}
            style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={spring}
          >
            <button className={modalStyles.closeBtn} onClick={onClose}>
              <img src="/closeicon.svg" alt="Fechar" width={24} height={24} />
            </button>

            <div className={modalStyles.header}>
              <div className={`${modalStyles.iconWrapper}`} style={{ marginTop: '1rem' }}>
                <IconAdd size={32} color="#6A4C93" />
              </div>
              <h2>Adicionar Vários Produtos</h2>
              <p>Adicione múltiplos produtos de uma vez ao catálogo</p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 2rem 2rem' }}>
              <form id="bulkForm" onSubmit={handleSubmit}>
                {drafts.map((draft, index) => (
                  <motion.div 
                    key={draft.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.bulkItemWrapper}
                  >
                    <div className={styles.bulkGrid}>
                      {/* Image Upload */}
                      <div>
                        <label 
                          className={styles.bulkImageUploadLabel}
                          style={{ 
                            backgroundImage: draft.imagePreview ? `url(${draft.imagePreview})` : 'none'
                          }}
                        >
                          <input type="file" accept="image/*" onChange={(e) => handleImageChange(draft.id, e)} style={{ display: 'none' }} />
                          {!draft.imagePreview && <IconUpload size={20} color="#999" />}
                        </label>
                      </div>

                      {/* Fields Column 1 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div className={modalStyles.inputGroup}>
                          <div className={modalStyles.inputWrapper}>
                             <IconTag size={16} color="#999" className={modalStyles.inputIcon} />
                             <input 
                                placeholder="Nome do Produto" 
                                value={draft.name} 
                                onChange={e => updateDraft(draft.id, 'name', e.target.value)}
                                required
                                style={{ fontSize: '14px' }}
                             />
                          </div>
                        </div>
                        <div className={modalStyles.inputGroup}>
                          <div className={modalStyles.inputWrapper}>
                             <span className={modalStyles.inputIcon} style={{ fontSize: '14px', fontWeight: 'bold', top: '50%', transform: 'translateY(-50%)' }}>R$</span>
                             <input 
                                type="number" 
                                placeholder="Preço" 
                                value={draft.price} 
                                onChange={e => updateDraft(draft.id, 'price', e.target.value)}
                                required
                                style={{ fontSize: '14px' }}
                             />
                          </div>
                        </div>
                      </div>

                      {/* Fields Column 2 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                         {/* Category */}
                         <div className={styles.customSelect} style={{ position: 'relative' }}>
                            <div className={modalStyles.inputGroup}>
                              <div className={modalStyles.inputWrapper}>
                                <IconPackage size={16} color="#999" className={modalStyles.inputIcon} />
                                <input
                                  placeholder="Categoria"
                                  value={draft.category}
                                  onChange={e => updateDraft(draft.id, 'category', e.target.value)}
                                  onFocus={() => setActiveDropdown({ index, type: 'category' })}
                                  onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                  required
                                  style={{ fontSize: '14px' }}
                                />
                              </div>
                            </div>
                            <AnimatePresence>
                              {activeDropdown?.index === index && activeDropdown.type === 'category' && existingCategories.length > 0 && (
                                <motion.div 
                                  className={styles.dropdown} 
                                  style={{ position: 'absolute', width: '100%', zIndex: 100 }}
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {existingCategories.filter(c => c.toLowerCase().includes(draft.category.toLowerCase())).map(c => (
                                    <div key={c} className={styles.dropdownItem} onMouseDown={() => updateDraft(draft.id, 'category', c)}>
                                      {c}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </div>

                         {/* Subcategory */}
                         <div className={styles.customSelect} style={{ position: 'relative' }}>
                            <div className={modalStyles.inputGroup}>
                              <div className={modalStyles.inputWrapper}>
                                <IconPackage size={16} color="#999" className={modalStyles.inputIcon} />
                                <input
                                  placeholder="Subcategoria"
                                  value={draft.subcategory}
                                  onChange={e => updateDraft(draft.id, 'subcategory', e.target.value)}
                                  onFocus={() => setActiveDropdown({ index, type: 'subcategory' })}
                                  onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                  style={{ fontSize: '14px' }}
                                />
                              </div>
                            </div>
                            <AnimatePresence>
                              {activeDropdown?.index === index && activeDropdown.type === 'subcategory' && existingSubcategories.length > 0 && (
                                <motion.div 
                                  className={styles.dropdown} 
                                  style={{ position: 'absolute', width: '100%', zIndex: 100 }}
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {existingSubcategories.filter(s => s.toLowerCase().includes(draft.subcategory.toLowerCase())).map(s => (
                                    <div key={s} className={styles.dropdownItem} onMouseDown={() => updateDraft(draft.id, 'subcategory', s)}>
                                      {s}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </div>
                      </div>
                    </div>
                    
                    {drafts.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeDraft(draft.id)}
                        style={{ 
                          position: 'absolute', 
                          top: '10px', 
                          right: '10px', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          color: '#FF595E'
                        }}
                      >
                        <IconDelete size={18} />
                      </button>
                    )}
                  </motion.div>
                ))}

                <button 
                  type="button" 
                  onClick={addDraft}
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    border: '2px dashed #ccc', 
                    borderRadius: '8px', 
                    background: 'none', 
                    color: '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 500
                  }}
                >
                  <IconAdd size={20} /> Adicionar mais um produto
                </button>
              </form>
            </div>

            <div className={modalStyles.footer} style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button 
                  type="button" 
                  onClick={onClose}
                  className={styles.cancelBtn}
               >
                 Cancelar
               </button>
               <button 
                  type="submit" 
                  form="bulkForm"
                  className={modalStyles.submitBtn}
                  disabled={isSubmitting}
                  style={{ width: 'auto', padding: '0 2rem', margin: 0 }}
               >
                 {isSubmitting ? 'Salvando...' : `Salvar ${drafts.length} Produtos`}
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
