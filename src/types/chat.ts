export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isTyping?: boolean;
}

export interface LangflowResponse {
  outputs: Array<{
    outputs: Array<{
      results: {
        message: {
          text: string;
        };
      };
    }>;
  }>;
}

export interface LangflowRequest {
  input_value: string;
  output_type: string;
  input_type: string;
}