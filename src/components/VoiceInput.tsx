import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onComplete: (text: string) => void;
  autoSend: boolean;
}

const VoiceInput = ({ onTranscript, onComplete, autoSend }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { theme } = useTheme();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'th-TH';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = finalTranscript + interimTranscript;
          setTranscript(fullTranscript);
          onTranscript(fullTranscript);

          // Reset timeout for auto-stop
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Auto-stop after 2 seconds of silence
          timeoutRef.current = setTimeout(() => {
            if (isListening && finalTranscript.trim()) {
              stopListening();
            }
          }, 2000);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            // Restart if still supposed to be listening
            recognitionRef.current?.start();
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, onTranscript]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
      
      if (transcript.trim()) {
        onComplete(transcript.trim());
        
        if (autoSend) {
          // Auto-send will be handled by parent component
        }
      }
      
      setTranscript('');
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleListening}
          className={`rounded-full transition-all duration-300 ${
            isListening
              ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-400'
              : theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="recording"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <Square className="w-4 h-4 fill-current" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                transition={{ duration: 0.2 }}
              >
                <Mic className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Recording indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-full h-full bg-red-500 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;