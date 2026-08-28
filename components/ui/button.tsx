import type { ButtonHTMLAttributes } from 'react';

export default function Button({ variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <button {...props} className={`ui-button ${variant} ${className}`.trim()} />;
}
