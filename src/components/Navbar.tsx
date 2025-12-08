import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Home, User, Mail } from 'lucide-react';
import styles from './Navbar.module.css';

const links = [
  { path: '/', name: 'Início', icon: <Home size={18} /> },
  { path: '/produtos', name: 'Produtos', icon: <ShoppingBag size={18} /> },
  { path: '/sobre', name: 'Sobre', icon: <User size={18} /> },
  { path: '/contato', name: 'Contato', icon: <Mail size={18} /> },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>Mel</span>
          <span className={styles.logoHighlight}>Colorindo</span>
        </Link>

        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          {links.map((link) => (
            <Link key={link.path} to={link.path} className={styles.navLink}>
              {link.name}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="underline"
                  className={styles.activeUnderline}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className={styles.menuToggle} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.mobileMenu}
          >
            {links.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={styles.mobileNavLink}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.iconWrapper}>{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
