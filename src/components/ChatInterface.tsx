import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import { ChatInput } from './ChatInput';
import TypingIndicator from './TypingIndicator';
import ThemeToggle from './ThemeToggle';
import SettingsPanel from './SettingsPanel';
import { useLangflow } from '@/hooks/useLangflow';
import { useTheme } from '@/contexts/ThemeContext';
import { Message, MessageImage } from '@/types/chat';
import { Bot, Sparkles, Zap, Stars, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'สวัสดีครับ! ผมเป็น **AI Assistant** ที่ขับเคลื่อนด้วย *Langflow* พร้อมช่วยเหลือคุณในทุกเรื่อง\n\nคุณสามารถใช้ `Markdown` ในข้อความได้นะครับ เช่น:\n- **ตัวหนา**\n- *ตัวเอียง*\n- `โค้ด`\n\nตัวอย่างโค้ด Python:\n```python\ndef greet(name):\n    return f"สวัสดี {name}!"\n\nprint(greet("โลก"))\n```\n\nลองใช้ปุ่มไมค์เพื่อพูดข้อความได้ด้วยนะครับ! 🎤',
      sender: 'agent',
      timestamp: new Date(),
    }
  ]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [isFullWidthChat, setIsFullWidthChat] = useState(false);
  
  const { sendMessageStream, isLoading, error } = useLangflow();
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedAutoSend = localStorage.getItem('autoSend');
    if (savedAutoSend) {
      setAutoSend(JSON.parse(savedAutoSend));
    }
    const savedFullWidthChat = localStorage.getItem('fullWidthChat');
    if (savedFullWidthChat) {
      setIsFullWidthChat(JSON.parse(savedFullWidthChat));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string, images?: MessageImage[]) => {
    console.log('handleSendMessage called with:', { content, images });
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      images: images,
    };
    
    console.log('Created user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);

    // Streaming agent message
    const agentId = (Date.now() + 1).toString();
    let streamedText = "";
    setMessages(prev => [...prev, {
      id: agentId,
      content: "",
      sender: 'agent',
      timestamp: new Date(),
      streaming: true
    }]);
    
    try {
      // If there are images, include them in the message context
      const messageWithImages = images && images.length > 0 
        ? `${content}\n\n[ผู้ใช้ส่งรูปภาพ ${images.length} รูป]`
        : content;
        
      await sendMessageStream(messageWithImages, (partial) => {
        streamedText = partial;
        setMessages(prev => prev.map(m =>
          m.id === agentId ? { ...m, content: streamedText, streaming: true } : m
        ));
      });
      setMessages(prev => prev.map(m =>
        m.id === agentId ? { ...m, streaming: false } : m
      ));
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === agentId ? { ...m, content: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง', streaming: false } : m
      ));
    }
  };

  const handleAutoSendChange = (value: boolean) => {
    setAutoSend(value);
    localStorage.setItem('autoSend', JSON.stringify(value));
  };

  const handleFullWidthChatChange = (value: boolean) => {
    setIsFullWidthChat(value);
    localStorage.setItem('fullWidthChat', JSON.stringify(value));
  };

  return (
  <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Animated Background - Darker theme */}
      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        {/* Floating orbs - More subtle for dark theme */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-gray-600/10' : 'bg-purple-300/30'
          }`}
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-gray-700/10' : 'bg-blue-300/30'
          }`}
        />
      </div>

      {/* Glassmorphism overlay */}
      <div className={`absolute inset-0 backdrop-blur-[1px] ${
        theme === 'dark' ? 'bg-black/10' : 'bg-white/20'
      }`} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 backdrop-blur-xl border-b p-6 shadow-2xl ${
          theme === 'dark' 
            ? 'bg-gray-900/70 border-gray-700/50' 
            : 'bg-white/70 border-gray-200/50'
        }`}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* AI Assistant Branding */}
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="relative"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: 1
                }}
                className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center"
              >
                <Stars className="w-2 h-2 text-white" />
              </motion.div>
            </motion.div>
            
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === 'dark'
                    ? 'from-purple-300 via-pink-300 to-blue-300'
                    : 'from-purple-600 via-pink-600 to-blue-600'
                }`}
              >
                Langflow AI Assistant
              </motion.h1>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <motion.div
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                className={`rounded-full transition-all duration-300 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Messages Container */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 ultra-thin-scrollbar">
        <div className={isFullWidthChat ? 'w-full' : 'max-w-4xl mx-auto'}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                index={index}
              />
            ))}
          </AnimatePresence>
          
          {isLoading && <TypingIndicator />}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-4"
            >
              <div className={`backdrop-blur-sm border rounded-2xl px-6 py-3 text-sm shadow-xl ${
                theme === 'dark'
                  ? 'bg-red-500/20 border-red-400/30 text-red-300'
                  : 'bg-red-100/80 border-red-300/50 text-red-700'
              }`}>
                เกิดข้อผิดพลาด: {error}
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input - sticky bottom */}
      <div className="relative z-10 w-full mt-auto">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          autoSend={autoSend}
        />
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autoSend={autoSend}
        onAutoSendChange={handleAutoSendChange}
        isFullWidthChat={isFullWidthChat}
        onFullWidthChatChange={handleFullWidthChatChange}
      />
    </div>
  );
};