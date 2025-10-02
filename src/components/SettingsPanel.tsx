import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  autoSend: boolean;
  onAutoSendChange: (value: boolean) => void;
  isFullWidthChat: boolean;
  onFullWidthChatChange: (value: boolean) => void;
}

const SettingsPanel = ({ isOpen, onClose, autoSend, onAutoSendChange, isFullWidthChat, onFullWidthChatChange }: SettingsPanelProps) => {
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 h-full w-80 shadow-2xl z-50 ${
              theme === 'dark'
                ? 'bg-gray-900/95 border-l border-gray-700/50'
                : 'bg-white/95 border-l border-gray-200/50'
            } backdrop-blur-xl`}
          >
            {/* Header */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`} />
                  <h2 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    ตั้งค่า
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className={`rounded-full ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-100px)]">
              {/* Voice Input Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mic className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h3 className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    การใช้เสียง
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        ส่งข้อความอัตโนมัติ
                      </Label>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ส่งข้อความทันทีเมื่อพูดจบ
                      </p>
                    </div>
                    <Switch
                      checked={autoSend}
                      onCheckedChange={onAutoSendChange}
                    />
                  </div>
                </div>
              </div>

              {/* Chat Width Setting */}
              <div className="flex items-center justify-between mt-4">
                <div className="space-y-1">
                  <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>ขยายแชทเต็มจอ</Label>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>เลือกให้แชทขยายเต็มซ้ายขวา</p>
                </div>
                <Switch
                  checked={isFullWidthChat}
                  onCheckedChange={onFullWidthChatChange}
                />
              </div>

              {/* Instructions */}
              <div className={`p-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50'
                  : 'bg-gray-50 border border-gray-200/50'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  วิธีใช้งาน
                </h4>
                <ul className={`text-sm space-y-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <li>• กดปุ่มไมค์เพื่อเริ่มพูด</li>
                  <li>• ข้อความจะแสดงแบบ real-time</li>
                  <li>• หยุดพูด 2 วินาทีเพื่อจบ</li>
                  <li>• เปิด "ส่งอัตโนมัติ" เพื่อส่งทันที</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;