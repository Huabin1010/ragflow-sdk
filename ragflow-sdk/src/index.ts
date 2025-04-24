import { RagFlowClientConfig } from './types';
import { createHttpClient, HttpClient } from './utils';
import { DatasetManager } from './datasets';
import { DocumentsAPI } from './documents';
import { ChunkManager } from './chunks';
import { RetrievalManager } from './retrieval';
import { ChatManager } from './chat';
import { ChatAssistantManager } from './chat-assistants';
import { AgentManager } from './agents';

/**
 * RagFlow API 客户端类
 * 提供了与RagFlow API交互的接口
 */
export class RagFlowClient {
  private client: HttpClient;
  public datasets: DatasetManager;
  public documents: DocumentsAPI;
  public chunks: ChunkManager;
  public retrieval: RetrievalManager;
  public chat: ChatManager;
  public chatAssistants: ChatAssistantManager;
  public agents: AgentManager;

  /**
   * 构造函数
   * @param config 客户端配置
   */
  constructor(config: RagFlowClientConfig) {
    this.client = createHttpClient(config);
    
    // 初始化各个模块
    this.datasets = new DatasetManager(this.client);
    this.documents = new DocumentsAPI(this.client);
    this.chunks = new ChunkManager(this.client);
    this.retrieval = new RetrievalManager(this.client);
    this.chat = new ChatManager(this.client);
    this.chatAssistants = new ChatAssistantManager(this.client);
    this.agents = new AgentManager(this.client);
  }
}

// 导出类型和工具类
export * from './types';
export { HttpClient } from './utils'; 