import { motion } from 'framer-motion';
import { Message } from '@/types/chat';
import { Bot, User, Copy, Check } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message & { streaming?: boolean };
  index: number;
}

const MessageBubble = ({ message, index }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      className={`flex items-start space-x-3 mb-8 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl relative ${
          isUser
            ? 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
            : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500'
        }`}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-md ${
          isUser ? 'bg-gradient-to-br from-blue-400 to-purple-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'
        } opacity-40`} />
        
        <div className="relative z-10">
          {isUser ? (
            <User className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
        </div>
      </motion.div>

      {/* Message Bubble */}
      <motion.div
        transition={{ type: "spring", stiffness: 400 }}
        className={`max-w-xs lg:max-w-2xl px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-800/80 backdrop-blur-xl text-gray-100 border-gray-600/30'
            : 'bg-white/90 backdrop-blur-xl text-gray-800 border-gray-200/50 shadow-lg'
        }`}
      >
        {/* Glassmorphism overlay */}
        <div className={`absolute inset-0 ${
          theme === 'dark' ? 'bg-white/5' : 'bg-white/20'
        } backdrop-blur-sm`} />
        
        {/* Animated border glow */}
        {/* Static blue glow for user bubble */}
        <div
          className={`absolute inset-0 rounded-3xl ${
            theme === 'dark'
              ? 'shadow-lg shadow-gray-300/20'
              : 'shadow-lg shadow-gray-300/10'
          }`}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <MarkdownRenderer 
            content={message.content}
            className={`text-sm leading-relaxed break-words whitespace-pre-wrap max-w-full ${
              theme === 'dark'
                ? 'text-gray-100'
                : 'text-gray-800'
            }`}
          />
          <div className="flex items-center justify-between gap-2 mt-3">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-xs relative z-10 ${
                theme === 'dark'
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }`}
            >
              {message.timestamp.toLocaleTimeString('th-TH', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </motion.p>
            <motion.button
              whileTap={{ scale: 0.8 }}
              animate={copied ? { scale: [1, 1.2, 1], rotate: [0, 20, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
              onClick={handleCopyAll}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 z-20 transition-colors"
              title="คัดลอกข้อความทั้งหมด"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>
        </motion.div>
        
        {/* timestamp and copy icon moved above */}
      </motion.div>
    </motion.div>
  );
};

export default MessageBubble;