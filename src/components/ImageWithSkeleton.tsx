import { useState, useCallback } from 'react';
import type { ImgHTMLAttributes, CSSProperties } from 'react';

interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string; // ex: "1/1", "16/9", "4/3"
  skeletonColor?: string;
  borderRadius?: string;
}

/**
 * Componente de imagem otimizado com skeleton loading
 * - Evita Layout Shift (CLS) com aspect-ratio fixo
 * - Usa decoding="async" para não bloquear a thread principal
 * - Loading lazy por padrão
 * - Transição suave de skeleton para imagem
 */
export const ImageWithSkeleton = ({
  src,
  alt,
  aspectRatio = '1/1',
  skeletonColor = '#e0e0e0',
  borderRadius = '8px',
  className,
  style,
  ...props
}: ImageWithSkeletonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio,
    overflow: 'hidden',
    borderRadius,
    backgroundColor: skeletonColor,
    ...style,
  };

  const imageStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  const skeletonStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, ${skeletonColor} 25%, #f5f5f5 50%, ${skeletonColor} 75%)`,
    backgroundSize: '200% 100%',
    animation: isLoaded ? 'none' : 'shimmer 1.5s infinite',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  };

  const fallbackStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '2rem',
    color: '#999',
  };

  return (
    <div style={containerStyle} className={className}>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
      
      {!isLoaded && <div style={skeletonStyle} />}
      
      {hasError ? (
        <div style={fallbackStyle}>📷</div>
      ) : (
        <img
          src={src}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export default ImageWithSkeleton;
