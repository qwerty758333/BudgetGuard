import { type CSSProperties } from 'react';
import { motion } from 'framer-motion';

export interface BadgeDisplayProps {
  icon: string;
  name: string;
  description: string;
  earned: boolean;
}

const styles: Record<string, CSSProperties> = {
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '1.25rem 1rem',
    borderRadius: '12px',
    minHeight: '160px',
    width: '100%',
    boxSizing: 'border-box',
  },
  earnedCard: {
    backgroundColor: '#FCD34D',
  },
  lockedCard: {
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  iconWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  iconEarned: {
    fontSize: '3.75rem',
    lineHeight: 1,
  },
  iconLocked: {
    fontSize: '3rem',
    lineHeight: 1,
  },
  checkmark: {
    position: 'absolute',
    top: '-4px',
    right: '-8px',
    fontSize: '1.25rem',
    lineHeight: 1,
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    width: '1.75rem',
    height: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
  },
  name: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#1e1b4b',
    fontFamily: 'Nunito, system-ui, sans-serif',
    marginBottom: '0.25rem',
    lineHeight: 1.3,
  },
  description: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontFamily: 'Nunito, system-ui, sans-serif',
    lineHeight: 1.4,
    maxWidth: '12rem',
  },
};

export function BadgeDisplay({ icon, name, description, earned }: BadgeDisplayProps) {
  if (!earned) {
    return (
      <div style={{ ...styles.card, ...styles.lockedCard }} aria-label={`${name} (locked)`}>
        <div style={styles.iconWrap}>
          <span style={styles.iconLocked} aria-hidden>
            {icon}
          </span>
        </div>
        <h3 style={styles.name}>{name}</h3>
        <p style={styles.description}>{description}</p>
      </div>
    );
  }

  return (
    <motion.div
      style={{ ...styles.card, ...styles.earnedCard }}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, duration: 0.6 }}
      aria-label={`${name} (earned)`}
    >
      <div style={styles.iconWrap}>
        <motion.span
          style={styles.iconEarned}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          aria-hidden
        >
          {icon}
        </motion.span>
        <span style={styles.checkmark} aria-hidden>
          ✓
        </span>
      </div>
      <h3 style={styles.name}>{name}</h3>
      <p style={styles.description}>{description}</p>
    </motion.div>
  );
}
