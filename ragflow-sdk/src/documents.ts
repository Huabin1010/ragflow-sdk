import { 
  Document, 
  UpdateDocumentParams, 
  ListDocumentsParams,
  DocumentListResponse
} from './types';
import { createFormData, HttpClient } from './utils';

/**
 * 文档管理类
 */
export class DocumentsAPI {
  private client: HttpClient;
  
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * 创建/上传文档
   * @param datasetId 数据集ID
   * @param files 可以是文件列表、Buffer列表或带文件名的Buffer对象列表
   * @param chunkMethod 分块方法
   * @returns 创建的文档信息
   */
  async create(
    datasetId: string, 
    files: string[] | Buffer[] | { content: Buffer, filename: string }[], 
    chunkMethod?: string
  ): Promise<Document[]> {
    // 注意：如果使用文件路径字符串，需要在调用环境中引入fs模块
    const formData = createFormData(files);
    
    // 如果指定了分块方法，添加到表单数据中
    if (chunkMethod) {
      formData.append('chunk_method', chunkMethod);
    }
    
    return await this.client.postForm<Document[]>(`/api/v1/datasets/${datasetId}/documents`, formData);
  }

  /**
   * 上传文档 (向后兼容)
   * @param datasetId 数据集ID
   * @param file 可以是文件路径、Buffer或带文件名的Buffer对象
   * @param chunkMethod 分块方法
   * @returns 创建的文档信息
   */
  async upload(
    datasetId: string, 
    file: string | Buffer | { content: Buffer, filename: string }, 
    chunkMethod?: string
  ): Promise<Document[]> {
    // 根据传入的file类型，创建正确类型的数组
    if (typeof file === 'string') {
      return this.create(datasetId, [file], chunkMethod);
    } else if (Buffer.isBuffer(file)) {
      return this.create(datasetId, [file as Buffer], chunkMethod);
    } else {
      return this.create(datasetId, [file as { content: Buffer, filename: string }], chunkMethod);
    }
  }

  /**
   * 解析文档 (向后兼容)
   * @param datasetId 数据集ID
   * @param documentIds 文档ID数组
   * @returns 成功则返回空对象
   */
  async parse(datasetId: string, documentIds: string[]): Promise<void> {
    return await this.client.post<void>(`/api/v1/datasets/${datasetId}/chunks`, { document_ids: documentIds });
  }

  /**
   * 删除文档
   * @param datasetId 数据集ID
   * @param documentIds 文档ID数组
   * @returns 成功则返回空对象
   */
  async delete(datasetId: string, documentIds: string[]): Promise<void> {
    return await this.client.delete<void>(`/api/v1/datasets/${datasetId}/documents`, { ids: documentIds });
  }

  /**
   * 更新文档
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   * @param params 更新参数
   * @returns 成功则返回空对象
   */
  async update(datasetId: string, documentId: string, params: UpdateDocumentParams): Promise<void> {
    return await this.client.put<void>(`/api/v1/datasets/${datasetId}/documents/${documentId}`, params);
  }

  /**
   * 获取文档列表
   * @param datasetId 数据集ID
   * @param params 查询参数
   * @returns 文档列表
   */
  async list(datasetId: string, params: ListDocumentsParams = {}): Promise<DocumentListResponse> {
    return await this.client.get<DocumentListResponse>(`/api/v1/datasets/${datasetId}/documents`, params);
  }

  /**
   * 获取单个文档
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   * @returns 文档信息
   */
  async get(datasetId: string, documentId: string): Promise<Document> {
    const response = await this.client.get<DocumentListResponse>(`/api/v1/datasets/${datasetId}/documents`, { 
      id: documentId 
    });
    
    if (!response || !response.docs || response.docs.length === 0) {
      throw new Error(`Document with ID ${documentId} not found in dataset ${datasetId}`);
    }
    
    return response.docs[0];
  }

  /**
   * 重新处理文档
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   * @returns 成功则返回空对象
   */
  async reprocess(datasetId: string, documentId: string, options: { 
    chunk_method?: string;
    parser_config?: {
      chunk_token_count?: number;
      delimiter?: string;
      layout_recognize?: boolean;
      task_page_size?: number;
      raptor?: { use_raptor: boolean };
      entity_types?: string[];
    };
  } = {}): Promise<void> {
    return await this.client.post<void>(`/api/v1/datasets/${datasetId}/documents/${documentId}/reprocess`, options);
  }

  /**
   * 获取文档处理状态
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   * @returns 文档状态
   */
  async getStatus(datasetId: string, documentId: string): Promise<Document> {
    return await this.client.get<Document>(`/api/v1/datasets/${datasetId}/documents/${documentId}/status`);
  }
} 