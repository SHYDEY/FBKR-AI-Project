import type { ButtonHTMLAttributes } from 'react';
export default function Button({ variant = 'default', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' }) { return <button className={`button ${variant === 'primary' ? 'button-primary' : ''} ${className}`} {...props} />; }
