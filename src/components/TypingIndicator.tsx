import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="flex items-center space-x-2 p-4"
    >
  <div>
        {/* Glassmorphism overlay */}
        
        {/* Animated glow */}
        
        {/* <div className="flex space-x-1 relative z-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className=""
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
                y: [0, -8, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div> */}
        
        {/* Sparkle effects */}
        <motion.div
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5
          }}
          className="absolute top-1 right-2 w-1 h-1 bg-yellow-400 rounded-full"
        />
        <motion.div
          animate={{
            scale: [0, 1, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 1
          }}
          className="absolute bottom-1 left-2 w-1 h-1 bg-pink-400 rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default TypingIndicator;