import { 
  Chunk, 
  ChunkListResponse, 
  AddChunkParams, 
  UpdateChunkParams, 
  ListChunksParams 
} from './types';
import { HttpClient } from './utils';

/**
 * 数据块管理类
 */
export class ChunkManager {
  private client: HttpClient;
  
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * 获取数据块列表
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   * @param params 查询参数
   * @returns 数据块列表
   */
  async list(
    datasetId: string, 
    documentId: string, 
    params: ListChunksParams = {}
  ): Promise<ChunkListResponse> {
    return await this.client.get<ChunkListResponse>(
      `/api/v1/datasets/${datasetId}/documents/${documentId}/chunks`, 
      params
    );
  }

  /**
   * 添加数据块
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   * @param params 数据块参数
   * @returns 创建的数据块
   */
  async add(
    datasetId: string, 
    documentId: string, 
    params: AddChunkParams
  ): Promise<Chunk> {
    return await this.client.post<Chunk>(
      `/api/v1/datasets/${datasetId}/documents/${documentId}/chunks`, 
      params
    );
  }

  /**
   * 更新数据块
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   * @param chunkId 数据块ID
   * @param params 更新参数
   * @returns 成功则返回空对象
   */
  async update(
    datasetId: string, 
    documentId: string, 
    chunkId: string, 
    params: UpdateChunkParams
  ): Promise<void> {
    return await this.client.put<void>(
      `/api/v1/datasets/${datasetId}/documents/${documentId}/chunks/${chunkId}`, 
      params
    );
  }

  /**
   * 删除数据块
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   * @param chunkIds 数据块ID数组
   * @returns 成功则返回空对象
   */
  async delete(
    datasetId: string, 
    documentId: string, 
    chunkIds: string[]
  ): Promise<void> {
    return await this.client.post<void>(
      `/api/v1/datasets/${datasetId}/documents/${documentId}/chunks/delete`, 
      { ids: chunkIds }
    );
  }
} 