import { 
  Dataset, 
  CreateDatasetParams, 
  UpdateDatasetParams, 
  ListDatasetsParams 
} from './types';
import { HttpClient } from './utils';

/**
 * 数据集管理类
 */
export class DatasetManager {
  private client: HttpClient;
  
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * 创建数据集
   * @param params 创建数据集的参数
   * @returns 创建的数据集信息
   */
  async create(params: CreateDatasetParams): Promise<Dataset> {
    return await this.client.post<Dataset>('/api/v1/datasets', params);
  }

  /**
   * 删除数据集
   * @param ids 要删除的数据集ID数组
   * @returns 成功则返回空对象
   */
  async delete(ids: string[]): Promise<void> {
    return await this.client.delete<void>('/api/v1/datasets', { ids });
  }

  /**
   * 更新数据集
   * @param datasetId 数据集ID
   * @param params 更新参数
   * @returns 成功则返回空对象
   */
  async update(datasetId: string, params: UpdateDatasetParams): Promise<void> {
    return await this.client.put<void>(`/api/v1/datasets/${datasetId}`, params);
  }

  /**
   * 获取数据集列表
   * @param params 查询参数
   * @returns 数据集列表
   */
  async list(params: ListDatasetsParams = {}): Promise<Dataset[]> {
    return await this.client.get<Dataset[]>('/api/v1/datasets', params);
  }

  /**
   * 获取单个数据集
   * @param datasetId 数据集ID
   * @returns 数据集信息
   */
  async get(datasetId: string): Promise<Dataset> {
    const datasets = await this.client.get<Dataset[]>('/api/v1/datasets', { id: datasetId });
    
    if (!datasets || datasets.length === 0) {
      throw new Error(`Dataset with ID ${datasetId} not found`);
    }
    
    return datasets[0];
  }
} 