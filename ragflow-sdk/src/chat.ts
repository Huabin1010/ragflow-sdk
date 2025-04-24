import { ChatCompletionParams, ChatCompletionResponse } from './types';
import { HttpClient, handleStreamResponse } from './utils';

/**
 * 聊天完成管理类
 */
export class ChatManager {
  private client: HttpClient;
  
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * 创建聊天完成
   * @param chatId 聊天ID
   * @param params 聊天参数
   * @param onData 流式响应的数据处理函数，仅在stream=true时使用
   * @returns 聊天完成响应
   */
  async createCompletion(
    chatId: string,
    params: ChatCompletionParams,
    onData?: (data: any) => void
  ): Promise<ChatCompletionResponse> {
    if (params.stream && onData) {
      const stream = await this.client.postStream(
        `/api/v1/chats_openai/${chatId}/chat/completions`, 
        params
      );
      
      await handleStreamResponse(stream, onData);
      return {} as ChatCompletionResponse;
    } else {
      return await this.client.post<ChatCompletionResponse>(
        `/api/v1/chats_openai/${chatId}/chat/completions`, 
        params
      );
    }
  }
} 