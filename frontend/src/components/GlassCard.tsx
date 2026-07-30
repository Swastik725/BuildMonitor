import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

export function GlassCard({
  children,
  className = '',
  as: Component = motion.div,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: any;
  [key: string]: any;
}) {
  return (
    <Component
      whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`glass rounded-xl ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function GlassButton({
  children,
  className = '',
  variant = 'accent',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  variant?: 'accent' | 'ghost';
  [key: string]: any;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`${variant === 'accent' ? 'glass-btn' : 'border'} rounded-lg px-3.5 py-2 text-sm font-medium ${className}`}
      style={variant === 'ghost' ? { borderColor: 'var(--border)', color: 'var(--muted)' } : { color: 'var(--text)' }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
