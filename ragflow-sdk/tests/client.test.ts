import { RagFlowClient } from '../src';
import axios from 'axios';

// 模拟axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RagFlowClient', () => {
  let client: RagFlowClient;
  
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 模拟axios.create返回带有所需方法的对象
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    } as any);
    
    // 创建客户端实例
    client = new RagFlowClient({
      baseUrl: 'http://localhost:8000',
      apiKey: 'test-api-key'
    });
  });
  
  it('should create a client with the correct configuration', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json'
      }
    });
    
    // 检查是否正确初始化了所有管理器
    expect(client.datasets).toBeDefined();
    expect(client.documents).toBeDefined();
    expect(client.chunks).toBeDefined();
    expect(client.retrieval).toBeDefined();
    expect(client.chat).toBeDefined();
  });
  
  // 可以添加更多测试...
}); 