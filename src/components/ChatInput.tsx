import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceInput from './VoiceInput';
import { useTheme } from '@/contexts/ThemeContext';
import { MessageImage } from '@/types/chat';


interface ChatInputProps {
  onSendMessage: (message: string, images?: MessageImage[]) => void;
  isLoading: boolean;
  autoSend: boolean;
  onSendFile?: (file: File) => void;
}


export const ChatInput = ({ onSendMessage, isLoading, autoSend, onSendFile }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<MessageImage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Selected files:', files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    console.log('Image files:', imageFiles);
    
    imageFiles.forEach(file => {
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      console.log('Created URL for', file.name, ':', url);
      const imageData: MessageImage = {
        url,
        file,
        name: file.name,
        size: file.size
      };
      
      setSelectedImages(prev => [...prev, imageData]);
    });
    
    // Reset input value so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const imageToRemove = prev[index];
      // Revoke object URL to free memory
      if (imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Clean up object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      selectedImages.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [selectedImages]);

  // Reset textarea height when message is cleared
  useEffect(() => {
    if (!message && textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  }, [message]);

  // Function to auto-resize textarea
  const autoResize = (textarea: HTMLTextAreaElement) => {
    const defaultHeight = 48;
    const maxHeight = 200;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height based on content
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(defaultHeight, Math.min(scrollHeight, maxHeight));
    
    // Apply new height
    textarea.style.height = newHeight + 'px';
    
    // Show scrollbar if content exceeds max height
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedImages.length > 0) && !isLoading) {
      // Create a copy of selected images to avoid immediate cleanup
      const imagesToSend = selectedImages.map(img => ({ ...img }));
      onSendMessage(message.trim(), imagesToSend.length > 0 ? imagesToSend : undefined);
      setMessage('');
      // Note: Don't clean up URLs immediately - let them persist for message display
      setSelectedImages([]);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setMessage(text);
    // Auto-resize after setting text from voice input
    setTimeout(() => {
      if (textareaRef.current) {
        autoResize(textareaRef.current);
      }
    }, 0);
  };

  const handleVoiceComplete = (text: string) => {
    setMessage(text);
    // Auto-resize after setting text from voice input
    setTimeout(() => {
      if (textareaRef.current) {
        autoResize(textareaRef.current);
      }
    }, 0);
    
    if (autoSend && text.trim()) {
      // Create a copy of selected images to avoid immediate cleanup
      const imagesToSend = selectedImages.map(img => ({ ...img }));
      onSendMessage(text.trim(), imagesToSend.length > 0 ? imagesToSend : undefined);
      setMessage('');
      // Note: Don't clean up URLs immediately - let them persist for message display
      setSelectedImages([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
  className="pb-6 opacity-50 bg-transparent"
    >
      {/* Image Preview Section */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto mb-4"
          >
            <div className={`backdrop-blur-xl rounded-2xl p-4 border shadow-xl ${
              theme === 'dark'
                ? 'bg-gray-800/60 border-gray-600/50'
                : 'bg-white/80 border-gray-300/50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  รูปภาพที่เลือก ({selectedImages.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className={`w-full h-20 object-cover rounded-lg border ${
                        theme === 'dark' 
                          ? 'border-gray-600/50' 
                          : 'border-gray-300/50'
                      }`}
                    />
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors"
                      title="ลบรูปภาพ"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                    <div className={`absolute bottom-1 left-1 right-1 text-xs rounded px-1 py-0.5 truncate ${
                      theme === 'dark'
                        ? 'bg-black/60 text-white'
                        : 'bg-white/80 text-gray-800'
                    }`}>
                      {image.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

  <form onSubmit={handleSubmit} className="flex items-end justify-center space-x-4 max-w-4xl mx-auto">
        {/* Attachment Button */}

        {/* Attachment Button & Hidden File Input */}
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }} 
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 mb-2.5"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`rounded-full backdrop-blur-sm shadow-xl transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:text-white'
                : 'bg-gray-100/50 hover:bg-gray-200/50 border border-gray-300/50 text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            tabIndex={-1}
          />
        </motion.div>

        {/* Message Input Container */}
        <div className="flex-1 relative">
          <motion.div
            whileFocus={{ scale: 1.02 }}
            className="relative"
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                autoResize(e.target);
              }}
              placeholder="โปรดพิมพ์ข้อความ"
              disabled={isLoading}
              rows={1}
              style={{
                height: '48px',
                minHeight: '48px',
                maxHeight: '200px',
                resize: 'none',
                scrollbarWidth: 'thin',
                transition: 'height 0.2s ease-out, box-shadow 0.3s ease, border-color 0.3s ease',
                lineHeight: '1.4',
                fontSize: '14px',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                whiteSpace: 'pre-wrap',
                maxWidth: '100%',
              }}
              className={`w-full backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl input-scrollbar border-2 transition-all duration-300 pr-12 ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400/60 focus:shadow-2xl focus:shadow-purple-500/20'
                  : 'bg-white/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400/60 focus:shadow-2xl focus:shadow-purple-500/20'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {/* Static glow effect - no animation */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 -z-10 blur-md transition-opacity duration-300 ${
                message ? 'opacity-60' : 'opacity-0'
              }`}
            />
            {/* Voice Input Button inside textarea container */}
            <div className="absolute right-3 bottom-2 z-10">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                onComplete={handleVoiceComplete}
                autoSend={autoSend}
              />
            </div>
          </motion.div>
        </div>

        {/* ...existing code... */}

        {/* Send Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 mb-2.5"
        >
          <Button
            type="submit"
            disabled={(!message.trim() && selectedImages.length === 0) || isLoading}
            className="rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white px-8 py-4 shadow-2xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              animate={{
                x: [-100, 100],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            <div className="relative z-10">
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </div>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};