import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import {
  MsftOpenAIResponseFormat,
  MsftOpenAiMessage,
  getAzureOpenAIErrorResponse,
} from '../../types/responses/azureOpenAIErrorReponse';
import { AzureOpenAIRequest } from 'src/types/requests/AzureOpenAIRequest';

interface AzureOpenAILaunchpadConfigurationItem {
  model: string;
  authToken: string;
  endpoint: string;
  deploymentId: string;
}

export class AzureOpenAIService {
  private client: OpenAIClient | null;

  constructor() {
    this.client = null;
  }

  public async getAzureOpenAIResponse(
    aiRequest: AzureOpenAIRequest,
  ): Promise<MsftOpenAIResponseFormat | null> {
    const connections: AzureOpenAILaunchpadConfigurationItem[] = JSON.parse(
      process.env['AZURE_OPENAI_CONNECTIONS'] as string,
    );

    const useConnection = connections.filter(
      (c) => c.model == aiRequest.model,
    )[0];

    try {
      const startTime = performance.now();

      this.client = new OpenAIClient(
        useConnection.endpoint,
        new AzureKeyCredential(useConnection.authToken),
      );

      const retryCodes = [429, 503];
      const maxRetries = 3; // Maximum number of retries
      const retryDelay = 30000; // Delay between retries in milliseconds
      let retryCount = 0;

      async function makeOpenAIRequest(
        client: OpenAIClient,
      ): Promise<MsftOpenAIResponseFormat | null> {
        try {
          const openAiResponse = await client.getChatCompletions(
            useConnection.deploymentId,
            aiRequest.messages,
            {
              temperature: aiRequest.temperature ?? 1.0,
            },
          );

          if (
            openAiResponse.choices[0].message?.content?.toLowerCase() ===
            'backend call failure'
          ) {
            throw 'Backend call failure scenario';
          }

          const endTime = performance.now();

          // Calculate the elapsed time in milliseconds
          const elapsedTimeInMilliseconds = endTime - startTime;

          const launchpadOpenAIResponse: MsftOpenAIResponseFormat = {
            id: openAiResponse.id,
            created: openAiResponse.created.getTime(),
            model: aiRequest.model ?? 'gpt-3.5-turbo',
            object: '',
            usage: {
              completion_tokens: openAiResponse.usage.completionTokens,
              prompt_tokens: openAiResponse.usage.promptTokens,
              total_tokens: openAiResponse.usage.totalTokens,
            },
            choices: [
              {
                finish_reason: openAiResponse.choices[0].finishReason ?? '',
                index: openAiResponse.choices[0].index,
                logprobs: '',
                message: openAiResponse.choices[0].message as MsftOpenAiMessage,
              },
            ],
            NeudesicMetaData: {
              elapsedTimeInMilliseconds: elapsedTimeInMilliseconds,
              retryCount: retryCount,
            },
          };

          return launchpadOpenAIResponse;
        } catch (error: any) {
          if (
            retryCount < maxRetries &&
            retryCodes.includes(error?.statusCode)
          ) {
            retryCount++;
            await sleep(retryDelay);
            return await makeOpenAIRequest(client); // Retry the request recursively
          } else {
            // Handle other types of errors
            return getAzureOpenAIErrorResponse(error?.error, retryCount);
          }
        }
      }

      function sleep(retryDelay: number) {
        return new Promise((resolve) => setTimeout(resolve, retryDelay));
      }

      // Call the function to make the OpenAI request
      const result = await makeOpenAIRequest(this.client);

      return result;
    } catch (error: any) {
      throw error;
    }
  }
}
