import { RetrievalParams, RetrievalResult } from './types';
import { HttpClient } from './utils';

/**
 * 检索管理类
 */
export class RetrievalManager {
  private client: HttpClient;
  
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * 执行检索操作
   * @param params 检索参数
   * @returns 检索结果
   */
  async retrieve(params: RetrievalParams): Promise<RetrievalResult> {
    if (!params.dataset_ids && !params.document_ids) {
      throw new Error('必须提供 dataset_ids 或 document_ids 参数');
    }
    
    return await this.client.post<RetrievalResult>('/api/v1/retrieval', params);
  }
} 