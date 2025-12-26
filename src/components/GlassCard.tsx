import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  title?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  delay = 0,
  title,
  hoverEffect = true
}) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={hoverEffect ? { y: -4, boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' } : {}}
      className={`
        relative bg-white border-2 border-black rounded-xl p-6 md:p-8 
        shadow-pop transition-all duration-200 ease-out
        ${className}
      `}
    >
      {title && (
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dashed border-gray-200">
          <div className="w-4 h-4 bg-primary border-2 border-black rounded-sm transform rotate-45"></div>
          <h3 className="text-xl font-display font-extrabold text-black uppercase tracking-tight">{title}</h3>
        </div>
      )}

      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};