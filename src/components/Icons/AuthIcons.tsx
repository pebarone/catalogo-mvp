
import type { IconProps } from './types';

export const IconLogin = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
    <path d="M10 17L15 12L10 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }}/>
    <path d="M15 12H3" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
  </svg>
);

export const IconLogout = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
    <path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }}/>
    <path d="M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ stroke: color }}/>
  </svg>
);

export const IconKey = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="7" cy="17" r="4" stroke={color} strokeWidth="2"/>
    <path d="M10.5 14.5L21 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 4H21V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconEye = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
  </svg>
);

export const IconEyeOff = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3L21 21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path 
      d="M10.5 10.5C10.1872 10.8128 10 11.2373 10 11.6796C10 12.122 10.1872 12.5465 10.5 12.8593C10.8128 13.1721 11.2373 13.3593 11.6796 13.3593C12.122 13.3593 12.5465 13.1721 12.8593 12.8593" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M7.36 7.36C5.68 8.68 4.5 10.5 4 12C5 15 8 18 12 18C13.24 18 14.38 17.73 15.39 17.26" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M16.82 16.82C15.5 17.88 13.86 18.5 12 18.5C8 18.5 5 15 4 12C4.5 10.5 5.68 8.68 7.36 7.36" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path d="M12 5.5C16 5.5 19 9 20 12C19.5 13.5 18.32 15.32 16.64 16.64" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
