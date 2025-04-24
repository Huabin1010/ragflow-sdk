import {
  Agent,
  ListAgentsParams,
  AgentSession,
  CreateAgentSessionParams,
  ListAgentSessionsParams,
  AgentConverseParams,
  AgentConverseResponse
} from './types';
import { HttpClient, handleStreamResponse } from './utils';

/**
 * 代理管理类
 */
export class AgentManager {
  private client: HttpClient;
  
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * 获取代理列表
   * @param params 查询参数
   * @returns 代理列表
   */
  async list(params: ListAgentsParams = {}): Promise<Agent[]> {
    return await this.client.get<Agent[]>('/api/v1/agents', params);
  }

  /**
   * 创建代理会话
   * @param agentId 代理ID
   * @param params 创建会话参数，包括Begin组件指定的参数
   * @returns 创建的会话信息
   */
  async createSession(agentId: string, params: CreateAgentSessionParams = {}): Promise<AgentSession> {
    return await this.client.post<AgentSession>(`/api/v1/agents/${agentId}/sessions`, params);
  }

  /**
   * 获取代理会话列表
   * @param agentId 代理ID
   * @param params 查询参数
   * @returns 会话列表
   */
  async listSessions(agentId: string, params: ListAgentSessionsParams = {}): Promise<AgentSession[]> {
    return await this.client.get<AgentSession[]>(`/api/v1/agents/${agentId}/sessions`, params);
  }

  /**
   * 删除代理会话
   * @param agentId 代理ID
   * @param sessionIds 会话ID数组
   * @returns 成功则返回空对象
   */
  async deleteSessions(agentId: string, sessionIds: string[]): Promise<void> {
    return await this.client.delete<void>(`/api/v1/agents/${agentId}/sessions`, { ids: sessionIds });
  }

  /**
   * 与代理对话
   * @param agentId 代理ID
   * @param params 对话参数，包括Begin组件指定的参数
   * @param onData 流式响应的数据处理函数，仅在stream=true时使用
   * @returns 对话响应
   */
  async converse(
    agentId: string, 
    params: AgentConverseParams, 
    onData?: (data: { data: AgentConverseResponse | boolean }) => void
  ): Promise<AgentConverseResponse> {
    if (params.stream && onData) {
      // 流式响应
      const stream = await this.client.postStream(
        `/api/v1/agents/${agentId}/completions`,
        params
      );
      
      // 处理流式响应
      await handleStreamResponse(stream, onData);
      
      return {} as AgentConverseResponse;
    } else {
      // 非流式响应
      const nonStreamParams = { ...params, stream: false };
      return await this.client.post<AgentConverseResponse>(
        `/api/v1/agents/${agentId}/completions`,
        nonStreamParams
      );
    }
  }
} 