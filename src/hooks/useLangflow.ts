import { useState } from 'react';
import { LangflowResponse, LangflowRequest } from '@/types/chat';

export const useLangflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Streaming version: callback receives partial text
  const sendMessageStream = async (message: string, onStream: (text: string) => void): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock streaming response
      const mockResponses = [
        "สวัสดีครับ! ผมเป็น AI Assistant ที่พร้อมช่วยเหลือคุณ มีอะไรให้ช่วยไหมครับ?",
        "ขอบคุณสำหรับคำถามครับ ผมจะพยายามตอบให้ดีที่สุด",
        "นั่นเป็นคำถามที่น่าสนใจมากครับ ให้ผมคิดสักครู่นะ...",
        "ผมเข้าใจแล้วครับ นี่คือคำตอบที่ผมคิดว่าจะเป็นประโยชน์กับคุณ",
        "หากคุณมีคำถามเพิ่มเติม สามารถถามได้เสมอนะครับ"
      ];
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      let streamed = "";
      for (let i = 0; i < response.length; i++) {
        streamed += response[i];
        onStream(streamed);
        await new Promise(res => setTimeout(res, 25));
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessageStream, isLoading, error };
};