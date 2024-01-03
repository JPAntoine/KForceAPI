import { ChatRequestMessage } from '@azure/openai';

export interface AzureOpenAIRequest {
  model?: string;
  temperature?: number;
  messages: ChatRequestMessage[];
}
