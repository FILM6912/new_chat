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

  // Handlers and creator so we can recreate recognition if it was nulled
  function handleResult(event: SpeechRecognitionEvent) {
    // Skip processing if we're stopping
    if (isStoppingRef.current) return;

    let transcript = '';
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    transcript = transcript.trim();

    console.log('🔊 Direct speech transcript:', transcript);
    setTranscript(transcript);
    onTranscript(transcript);

    if (transcript.length > 0) {
      lastSpeechTimeRef.current = Date.now();
      lastFinalTranscriptRef.current = transcript;
    }

    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const finalResult = event.results[i][0].transcript.trim();
        if (finalResult) {
          console.log('✅ Final result detected, stopping microphone immediately:', finalResult);
          // Stop recognition immediately
          isStoppingRef.current = true;
          try { recognitionRef.current?.stop(); } catch (e) { console.log('Error stopping recognition in onresult:', e); }
          stopListening();
          return;
        }
      }
    }
  }

  function handleEnd() {
    console.log('🏁 Recognition ended, isStoppingRef:', isStoppingRef.current);
    if (!isStoppingRef.current) {
      console.log('🛑 Recognition ended naturally, stopping listening');
      stopListening();
    }
  }

  function handleError(event: SpeechRecognitionErrorEvent) {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      setIsListening(false);
      isStoppingRef.current = false;
      return;
    }
    if (event.error === 'aborted') return;
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
      console.log('⚠️ Speech recognition error, will restart on onend:', event.error);
      return;
    }
    setIsListening(false);
    isStoppingRef.current = false;
  }

  const createRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'th-TH';
    recognitionRef.current.onresult = handleResult;
    recognitionRef.current.onend = handleEnd;
    recognitionRef.current.onerror = handleError as any;
  };

  useEffect(() => {
    // Initialize recognition on component mount
    createRecognition();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current);
      }
      // Ensure recognition is fully stopped on unmount
      if (recognitionRef.current) {
        try {
          try { recognitionRef.current.onresult = null; } catch {}
          try { recognitionRef.current.onend = null; } catch {}
          try { recognitionRef.current.onerror = null; } catch {}
          recognitionRef.current.stop();
          try { (recognitionRef.current as any).abort?.(); } catch {}
        } catch (e) {
          console.warn('Error during recognition cleanup:', e);
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    // If recognition instance was nulled (after a stop), recreate it
    if (!recognitionRef.current) {
      createRecognition();
    }

    if (recognitionRef.current) {
      console.log(`Starting voice input with autoSend: ${autoSend}`);
      setIsListening(true);
      setTranscript('');
      lastFinalTranscriptRef.current = '';
      lastSpeechTimeRef.current = Date.now();
      isStoppingRef.current = false;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.log('Error starting recognition:', err);
        return;
      }

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
    console.log('🛑 stopListening called (force stop)');

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

    // Stop recognition immediately and detach handlers to ensure mic is released
    if (recognitionRef.current) {
      try {
        // remove handlers to avoid re-entrancy / restarts
        try { recognitionRef.current.onresult = null; } catch {}
        try { recognitionRef.current.onend = null; } catch {}
        try { recognitionRef.current.onerror = null; } catch {}

        recognitionRef.current.stop();
        // Some implementations also provide abort()
        try { (recognitionRef.current as any).abort?.(); } catch {}
        console.log('🔇 Recognition stopped successfully (handlers detached, abort attempted)');
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }

      // null out the instance so useEffect can recreate it on next start
      try {
        recognitionRef.current = null;
      } catch {}
    }

    const finalText = (lastFinalTranscriptRef.current || transcript).trim();
    console.log(`🏁 Stopping with text: "${finalText}"`);

    // Update UI state
    setIsListening(false);

    // Send the complete text
    if (finalText) {
      onComplete(finalText);
    }

    // Clear text states
    setTranscript('');
    lastFinalTranscriptRef.current = '';

    // Keep isStoppingRef true briefly; startListening will reset it
    setTimeout(() => {
      // leave it false if component still mounted; startListening sets it to false anyway
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