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
  const lastFinalTranscriptRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const silenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'th-TH';

        recognitionRef.current.onresult = (event) => {
          // Skip processing if we're stopping
          if (isStoppingRef.current) {
            return;
          }

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

          const fullTranscript = (lastFinalTranscriptRef.current + finalTranscript + interimTranscript).trim();
          setTranscript(fullTranscript);
          onTranscript(fullTranscript);

          // Update last speech time when we receive any speech input
          if (finalTranscript.trim() || interimTranscript.trim()) {
            const oldTime = lastSpeechTimeRef.current;
            lastSpeechTimeRef.current = Date.now();
            console.log(`🎤 Speech detected, updating lastSpeechTime: ${oldTime} -> ${lastSpeechTimeRef.current}`);
          }

          // Check if we have new final transcript
          if (finalTranscript.trim()) {
            lastFinalTranscriptRef.current += finalTranscript;
            console.log(`Final transcript received: "${finalTranscript}", total: "${lastFinalTranscriptRef.current}"`);
            
            // ปิดไมค์ทันทีหลังจากได้รับ final transcript
            console.log('🛑 Auto-stopping immediately after final transcript');
            isStoppingRef.current = true;
            stopListening();
            return;

            // Clear any existing timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            // Only set a very long backup timeout - let silence detection handle the main logic
            timeoutRef.current = setTimeout(() => {
              if (isListening && lastFinalTranscriptRef.current.trim()) {
                console.log('Backup timeout triggered, stopping...');
                stopListening();
              }
            }, 10000); // 10 second backup timeout (should never be reached)
          }
        };

        recognitionRef.current.onend = () => {
          if (isListening && !isStoppingRef.current) {
            // Restart if still supposed to be listening and not in stopping process
            try {
              recognitionRef.current?.start();
            } catch (error) {
              console.log('Failed to restart recognition:', error);
            }
          }
        };

        recognitionRef.current.onerror = (event) => {
          // Completely ignore aborted errors - they're normal when stopping
          if (event.error === 'aborted') {
            return;
          }
          
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          isStoppingRef.current = false;
        };
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current);
      }
    };
  }, [isListening, onTranscript]);

  const startListening = () => {
    if (recognitionRef.current) {
      console.log(`Starting voice input with autoSend: ${autoSend}`);
      setIsListening(true);
      setTranscript('');
      lastFinalTranscriptRef.current = '';
      lastSpeechTimeRef.current = Date.now();
      isStoppingRef.current = false;
      recognitionRef.current.start();

      // Start silence detection interval
      silenceCheckIntervalRef.current = setInterval(() => {
        if (!isListening) {
          console.log('Silence check skipped - not listening');
          return;
        }
        
        const now = Date.now();
        const silenceDuration = now - lastSpeechTimeRef.current;
        const maxSilence = autoSend ? 2000 : 3000; // 2s for autoSend, 3s for manual
        const hasText = lastFinalTranscriptRef.current.trim().length > 0;

        console.log(`Silence check: ${silenceDuration}ms elapsed, max: ${maxSilence}ms, hasText: ${hasText}, text: "${lastFinalTranscriptRef.current}"`);

        // If silence exceeded the limit and we have some text, stop listening
        if (silenceDuration > maxSilence && hasText) {
          console.log(`🔴 Silence detected: ${silenceDuration}ms > ${maxSilence}ms, auto-stopping...`);
          stopListening();
        } else if (silenceDuration > maxSilence * 0.7 && hasText) {
          // Log warning when approaching timeout
          console.log(`⚠️ Approaching silence timeout: ${silenceDuration}ms / ${maxSilence}ms`);
        }
      }, 300); // Check every 300ms for better responsiveness
    }
  };

  const stopListening = () => {
    console.log('stopListening called');
    
    // Set stopping flag to prevent restart and new processing
    isStoppingRef.current = true;
    
    // Clear all timeouts and intervals first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current);
      silenceCheckIntervalRef.current = null;
    }

    const finalText = (lastFinalTranscriptRef.current || transcript).trim();
    console.log(`Stopping with text: "${finalText}"`);
    
    setIsListening(false);
    
    if (finalText) {
      onComplete(finalText);
    }
    
    setTranscript('');
    lastFinalTranscriptRef.current = '';

    // Stop recognition after a short delay to allow current processing to finish
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping recognition:', error);
        }
      }
      isStoppingRef.current = false;
    }, 100);
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