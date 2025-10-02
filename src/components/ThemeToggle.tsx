import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.97 }}
      className="relative"
    >
      <Button
        onClick={toggleTheme}
        variant="ghost"
        size="icon"
        aria-label={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
        className={`rounded-full transition-all duration-300 shadow-lg overflow-visible ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-yellow-400/20 via-white/10 to-gray-900/80 border border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/30'
            : 'bg-gradient-to-br from-blue-200/30 via-white/80 to-gray-100/80 border border-blue-400/30 text-blue-700 hover:bg-blue-200/50'
        }`}
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute inset-0 rounded-full blur-md pointer-events-none ${
            theme === 'dark'
              ? 'bg-yellow-400/20'
              : 'bg-blue-400/20'
          }`}
        />
        <motion.div
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {theme === 'dark' ? (
            <Sun className="w-7 h-7 drop-shadow-lg" />
          ) : (
            <Moon className="w-7 h-7 drop-shadow-lg" />
          )}
        </motion.div>
      </Button>
      {/* Tooltip */}
      <div
        className="absolute left-1/2 -bottom-8 -translate-x-1/2 px-3 py-1 rounded bg-black/80 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      >
        {theme === 'dark' ? 'โหมดกลางคืน' : 'โหมดสว่าง'}
      </div>
    </motion.div>
  );
};

export default ThemeToggle;