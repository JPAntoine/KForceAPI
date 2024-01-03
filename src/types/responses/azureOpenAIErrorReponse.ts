interface ChatGptResponseUsage {
  prompt_tokens: number; // ex: 15
  completion_tokens: number; // ex: 131
  total_tokens: number; // ex: 146
}

interface MsftOpenAIChoicesMessage {
  index: number;
  logprobs: any;
  finish_reason: string;
  message: MsftOpenAiMessage;
}

export interface MsftOpenAiMessage {
  role: string;
  content: string;
}

export interface MsftOpenAIResponseFormat {
  id: string; // ex: chatcmpl-6whpEw2L2DFrI6T1F9MG1NmzwXeRj
  object: string; // ex: "chat.completion"
  created: number; // ex: 1679449508
  model: string; // ex: "gpt-3.5-turbo-0301"
  // usage: ChatGptResponseUsage,
  choices: MsftOpenAIChoicesMessage[];
  usage: ChatGptResponseUsage;
  NeudesicMetaData: {
    elapsedTimeInMilliseconds: number;
    retryCount: number;
  };
}

export const getAzureOpenAIErrorResponse = (
  error: any,
  retryCount: number = 1,
): MsftOpenAIResponseFormat => {
  console.log('getAzureOpenAIErrorResponse', {
    error: error,
    errMsg: error.message,
  });

  const useFinishReason = error?.code ? error.code : 'error';
  const useMessage = error?.message ? error.message : 'general error';

  const result: MsftOpenAIResponseFormat = {
    id: 'error',
    object: 'error',
    created: Date.now(),
    model: 'error',
    choices: [
      {
        index: 0,
        logprobs: 'error',
        finish_reason: useFinishReason,
        message: {
          role: 'error',
          content: useMessage,
        },
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
    NeudesicMetaData: {
      elapsedTimeInMilliseconds: 0,
      retryCount: retryCount,
    },
  };

  return result;
};
