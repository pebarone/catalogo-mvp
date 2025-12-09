import { IconHeart, IconInstagram } from './Icons';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <h3>Mel Colorindo a Vida</h3>
          <p>Acessórios encantados e divertidos 🌈</p>
          <p>Feitos à mão com amor no Brasil 🇧🇷</p>
        </div>
        
        <div className={styles.social}>
          <a href="https://instagram.com/mel_colorindo_a_vida" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <IconInstagram size={24} />
            <span>@mel_colorindo_a_vida</span>
          </a>
        </div>

        <div className={styles.copyright}>
          <p>
            Feito com <IconHeart size={14} className={styles.heart} fill="currentColor" /> para a Mel.
          </p>
          <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
