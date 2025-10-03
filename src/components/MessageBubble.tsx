import { motion } from 'framer-motion';
import { Message } from '@/types/chat';
import { Bot, User, Copy, Check, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

interface MessageBubbleProps {
  message: Message & { streaming?: boolean };
  index: number;
  onImageClick?: (image: { url: string; name?: string }) => void;
}

const MessageBubble = ({ message, index, onImageClick }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  // Debug: ตรวจสอบว่ามี images หรือไม่
  console.log('MessageBubble render:', {
    messageId: message.id,
    hasImages: !!message.images,
    imageCount: message.images?.length || 0,
    imageUrls: message.images?.map(img => img.url) || []
  });

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
          {/* Image Display */}
          {(() => {
            console.log('Image check:', {
              hasImages: !!message.images,
              imageCount: message.images?.length || 0,
              images: message.images
            });
            
            if (message.images && message.images.length > 0) {
              console.log('Rendering images for message:', message.id);
              return (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-3"
            >
              <div className="grid grid-cols-1 gap-2 max-w-sm">
                {message.images.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={image.url}
                      alt={image.name || `Image ${index + 1}`}
                      className={`rounded-lg shadow-lg max-w-full h-auto object-cover transition-all duration-300 ${
                        theme === 'dark'
                          ? 'border border-gray-600/50'
                          : 'border border-gray-300/50'
                      }`}
                      style={{ maxHeight: '300px', maxWidth: '100%' }}
                      onError={(e) => {
                        console.error('Image failed to load:', image.url, e);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', image.url);
                      }}
                      onClick={() => {
                        console.log('Image clicked in MessageBubble:', image.url);
                        onImageClick?.({ url: image.url, name: image.name });
                      }}
                    />
                    {/* Image overlay with info */}
                    {/* Zoom icon overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 rounded-lg flex items-center justify-center bg-black/40 transition-opacity"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-3"
                      >
                        <ZoomIn className="w-6 h-6 text-white" />
                      </motion.div>
                    </motion.div>

                    {/* Image info overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className={`absolute inset-0 rounded-lg flex items-end transition-opacity ${
                        theme === 'dark'
                          ? 'bg-gradient-to-t from-black/60 to-transparent'
                          : 'bg-gradient-to-t from-black/50 to-transparent'
                      }`}
                    >
                      <div className="p-2 text-white text-xs">
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>{image.name || `Image ${index + 1}`}</span>
                        </div>
                        {image.size && (
                          <div className="text-gray-300 text-xs">
                            {(image.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
              );
            }
            return null;
          })()}

          {/* Text Content */}
          {message.content && message.content.trim() !== '' && (
            <MarkdownRenderer 
              content={message.content}
              className={`text-sm leading-relaxed break-words whitespace-pre-wrap max-w-full ${
                theme === 'dark'
                  ? 'text-gray-100'
                  : 'text-gray-800'
              }`}
            />
          )}
          
          {/* No content message for image-only messages */}
          {(!message.content || message.content.trim() === '') && message.images && message.images.length > 0 && (
            <div className={`text-sm italic ${
              theme === 'dark'
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}>
              ส่งรูปภาพ
            </div>
          )}

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
      </motion.div>

    </motion.div>
  );
};

// Image Modal Component (outside of main component structure)
const ImageModal = ({ 
  selectedImage, 
  onClose 
}: { 
  selectedImage: { url: string; name?: string } | null;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, onClose]);

  if (!selectedImage) {
    console.log('ImageModal: No selectedImage');
    return null;
  }

  console.log('ImageModal: Rendering modal for', selectedImage.url);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image */}
        <img
          src={selectedImage.url}
          alt={selectedImage.name || 'Enlarged image'}
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: '90vh', maxWidth: '90vw' }}
          onError={(e) => {
            console.error('Modal image failed to load:', selectedImage.url);
          }}
        />

        {/* Image info bar */}
        {selectedImage.name && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{selectedImage.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component with modal
const MessageBubbleWithModal = ({ message, index }: Omit<MessageBubbleProps, 'onImageClick'>) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; name?: string } | null>(null);

  const handleImageClick = (image: { url: string; name?: string }) => {
    console.log('Image clicked:', image);
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    console.log('Modal closed');
    setSelectedImage(null);
  };

  return (
    <>
      <MessageBubble 
        message={message} 
        index={index} 
        onImageClick={handleImageClick}
      />
      <ImageModal 
        selectedImage={selectedImage} 
        onClose={handleCloseModal} 
      />
    </>
  );
};





export default MessageBubbleWithModal;