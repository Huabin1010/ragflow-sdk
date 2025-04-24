import {
  ChatAssistant,
  CreateChatAssistantParams,
  UpdateChatAssistantParams,
  ListChatAssistantsParams,
  ChatSession,
  CreateChatSessionParams,
  UpdateChatSessionParams,
  ListChatSessionsParams,
  ChatConverseParams,
  ChatConverseResponse
} from './types';
import { HttpClient, handleStreamResponse } from './utils';

/**
 * 聊天助手管理类
 */
export class ChatAssistantManager {
  private client: HttpClient;
  
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * 创建聊天助手
   * @param params 创建聊天助手的参数
   * @returns 创建的聊天助手信息
   */
  async create(params: CreateChatAssistantParams): Promise<ChatAssistant> {
    return await this.client.post<ChatAssistant>('/api/v1/chats', params);
  }

  /**
   * 更新聊天助手
   * @param chatId 聊天助手ID
   * @param params 更新参数
   * @returns 成功则返回空对象
   */
  async update(chatId: string, params: UpdateChatAssistantParams): Promise<void> {
    return await this.client.put<void>(`/api/v1/chats/${chatId}`, params);
  }

  /**
   * 删除聊天助手
   * @param ids 要删除的聊天助手ID数组
   * @returns 成功则返回空对象
   */
  async delete(ids: string[]): Promise<void> {
    return await this.client.delete<void>('/api/v1/chats', { ids });
  }

  /**
   * 获取聊天助手列表
   * @param params 查询参数
   * @returns 聊天助手列表
   */
  async list(params: ListChatAssistantsParams = {}): Promise<ChatAssistant[]> {
    return await this.client.get<ChatAssistant[]>('/api/v1/chats', params);
  }

  /**
   * 创建聊天会话
   * @param chatId 聊天助手ID
   * @param params 创建会话参数
   * @returns 创建的会话信息
   */
  async createSession(chatId: string, params: CreateChatSessionParams): Promise<ChatSession> {
    return await this.client.post<ChatSession>(`/api/v1/chats/${chatId}/sessions`, params);
  }

  /**
   * 更新聊天会话
   * @param chatId 聊天助手ID
   * @param sessionId 会话ID
   * @param params 更新参数
   * @returns 成功则返回空对象
   */
  async updateSession(chatId: string, sessionId: string, params: UpdateChatSessionParams): Promise<void> {
    return await this.client.put<void>(`/api/v1/chats/${chatId}/sessions/${sessionId}`, params);
  }

  /**
   * 获取聊天会话列表
   * @param chatId 聊天助手ID
   * @param params 查询参数
   * @returns 会话列表
   */
  async listSessions(chatId: string, params: ListChatSessionsParams = {}): Promise<ChatSession[]> {
    return await this.client.get<ChatSession[]>(`/api/v1/chats/${chatId}/sessions`, params);
  }

  /**
   * 删除聊天会话
   * @param chatId 聊天助手ID
   * @param sessionIds 会话ID数组
   * @returns 成功则返回空对象
   */
  async deleteSessions(chatId: string, sessionIds: string[]): Promise<void> {
    return await this.client.delete<void>(`/api/v1/chats/${chatId}/sessions`, { ids: sessionIds });
  }

  /**
   * 与聊天助手对话
   * @param chatId 聊天助手ID
   * @param params 对话参数
   * @param onData 流式响应的数据处理函数，仅在stream=true时使用
   * @returns 对话响应
   */
  async converse(
    chatId: string, 
    params: ChatConverseParams, 
    onData?: (data: { data: ChatConverseResponse | boolean }) => void
  ): Promise<ChatConverseResponse> {
    if (params.stream && onData) {
      // 流式响应
      const stream = await this.client.postStream(
        `/api/v1/chats/${chatId}/completions`,
        params
      );
      
      // 处理流式响应
      await handleStreamResponse(stream, onData);
      
      return {} as ChatConverseResponse;
    } else {
      // 非流式响应
      const nonStreamParams = { ...params, stream: false };
      return await this.client.post<ChatConverseResponse>(
        `/api/v1/chats/${chatId}/completions`,
        nonStreamParams
      );
    }
  }
} 