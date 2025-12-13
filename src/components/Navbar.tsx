import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconMenu, 
  IconClose, 
  IconShopping, 
  IconHome, 
  IconUser, 
  IconMail, 
  IconDashboard,
  IconHeart
} from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import styles from './Navbar.module.css';

const baseLinks = [
  { path: '/', name: 'Início', icon: <IconHome size={18} color="#FF595E" /> },
  { path: '/produtos', name: 'Produtos', icon: <IconShopping size={18} color="#FF924C" /> },
  { path: '/sobre', name: 'Sobre', icon: <IconUser size={18} color="#8AC926" /> },
  { path: '/contato', name: 'Contato', icon: <IconMail size={18} color="#1982C4" /> },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  // Escuta eventos customizados de outras páginas para abrir modal
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  // Adicionar link de favoritos se autenticado e link de admin se for admin
  const links = [
    ...baseLinks,
    ...(isAuthenticated ? [{ path: '/favoritos', name: 'Favoritos', icon: <IconHeart size={18} color="#c62828" /> }] : []),
    ...(isAdmin ? [{ path: '/admin', name: 'Admin', icon: <IconDashboard size={18} /> }] : [])
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <img src="/logo.png" alt="Mel Colorindo" style={{ height: '60px', width: 'auto' }} />
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

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <IconUser size={20} color="#6A4C93" />
                  <span className={styles.userEmail}>{user?.email}</span>
                </div>
                <button className={styles.authButton} onClick={handleLogout} title="Sair">
                  <img src="/logout.svg" alt="Logout" width={18} height={18} />
                </button>
              </div>
            ) : (
              <button
                className={styles.authButton}
                onClick={() => setIsLoginModalOpen(true)}
                title="Entrar"
              >
                <img src="/login.svg" alt="Login" width={18} height={18} />
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className={styles.menuToggle} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <IconClose size={24} color="#6A4C93" /> : <IconMenu size={24} color="#6A4C93" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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

              {/* Mobile Auth */}
              <div className={styles.mobileAuth}>
                {isAuthenticated ? (
                  <>
                    <span className={styles.mobileUserEmail}>{user?.email}</span>
                    <button
                      className={styles.mobileAuthButton}
                      onClick={handleLogout}
                    >
                      <img src="/logout.svg" alt="Logout" width={18} height={18} />
                      Sair
                    </button>
                  </>
                ) : (
                  <button
                    className={styles.mobileAuthButton}
                    onClick={() => {
                      setIsOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                  >
                    <img src="/login.svg" alt="Login" width={18} height={18} />
                    Entrar
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </>
  );
};
