import { motion } from 'framer-motion';
import { IconInstagram, IconMail, IconMapPin, IconPhone } from '../components/Icons';
import styles from './Contact.module.css';

export const Contact = () => {
  return (
    <div className={styles.page}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={styles.card}
      >
        <h1>Fale Conosco</h1>
        <p className={styles.subtitle}>Tem alguma dúvida ou quer fazer um pedido especial?</p>

        <div className={styles.links}>
          <a href="https://instagram.com/mel_colorindo_a_vida" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
            <div className={`${styles.iconBox} ${styles.insta}`}>
              <IconInstagram size={24} />
            </div>
            <div>
              <h3>Instagram</h3>
              <p>@mel_colorindo_a_vida</p>
            </div>
          </a>

          <a href="mailto:contato@mel.com" className={styles.linkItem}>
            <div className={`${styles.iconBox} ${styles.email}`}>
              <IconMail size={24} />
            </div>
            <div>
              <h3>Email</h3>
              <p>contato@mel.com</p>
            </div>
          </a>

          <a href="https://wa.me/5511972969552" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
            <div className={`${styles.iconBox} ${styles.whatsapp}`}>
              <IconPhone size={24} />
            </div>
            <div>
              <h3>WhatsApp</h3>
              <p>(11) 97296-9552</p>
            </div>
          </a>
        </div>

        <div className={styles.location}>
           <IconMapPin size={16} /> Enviamos para todo o Brasil!
        </div>
      </motion.div>
    </div>
  );
};
