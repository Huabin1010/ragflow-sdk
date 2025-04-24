import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { FormData } from 'formdata-node';
import { RagFlowClientConfig, RagFlowResponse } from './types';
import * as path from 'path';

/**
 * 自定义HTTP客户端类，采用单例模式
 */
export class HttpClient {
  private static instances: Map<string, HttpClient> = new Map();
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  private constructor(config: RagFlowClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  /**
   * 获取HttpClient实例
   */
  public static getInstance(config: RagFlowClientConfig): HttpClient {
    // 使用baseUrl+apiKey作为唯一标识符
    const key = `${config.baseUrl}_${config.apiKey}`;
    
    if (!HttpClient.instances.has(key)) {
      HttpClient.instances.set(key, new HttpClient(config));
    }
    
    return HttpClient.instances.get(key)!;
  }

  /**
   * 发送GET请求
   */
  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? createQueryString(params) : '';
    const fullUrl = `${this.baseUrl}${url}${queryString}`;
    
    const response = await axios.get(fullUrl, {
      headers: this.getHeaders(),
      timeout: this.timeout
    });
    
    return handleResponse<T>(response);
  }

  /**
   * 发送POST请求
   */
  public async post<T>(url: string, data?: any): Promise<T> {
    const response = await axios.post(`${this.baseUrl}${url}`, data, {
      headers: this.getHeaders(),
      timeout: this.timeout
    });
    
    return handleResponse<T>(response);
  }

  /**
   * 发送PUT请求
   */
  public async put<T>(url: string, data?: any): Promise<T> {
    const response = await axios.put(`${this.baseUrl}${url}`, data, {
      headers: this.getHeaders(),
      timeout: this.timeout
    });
    
    return handleResponse<T>(response);
  }

  /**
   * 发送DELETE请求
   */
  public async delete<T>(url: string, data?: any): Promise<T> {
    const response = await axios.delete(`${this.baseUrl}${url}`, {
      headers: this.getHeaders(),
      timeout: this.timeout,
      data: data
    });
    
    return handleResponse<T>(response);
  }

  /**
   * 发送表单数据（用于文件上传）
   */
  public async postForm<T>(url: string, formData: FormData): Promise<T> {
    const response = await axios.post(`${this.baseUrl}${url}`, formData, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: this.timeout
    });
    
    return handleResponse<T>(response);
  }

  /**
   * 获取流式响应
   */
  public async getStream(url: string, params?: Record<string, any>): Promise<any> {
    const queryString = params ? createQueryString(params) : '';
    const fullUrl = `${this.baseUrl}${url}${queryString}`;
    
    const response = await axios.get(fullUrl, {
      headers: this.getHeaders(),
      timeout: this.timeout,
      responseType: 'stream'
    });
    
    return response.data;
  }

  /**
   * 发送流式POST请求
   */
  public async postStream(url: string, data?: any): Promise<any> {
    const response = await axios.post(`${this.baseUrl}${url}`, data, {
      headers: this.getHeaders(),
      timeout: this.timeout,
      responseType: 'stream'
    });
    
    return response.data;
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }
}

/**
 * 创建一个HTTP客户端实例
 */
export function createHttpClient(config: RagFlowClientConfig): HttpClient {
  return HttpClient.getInstance(config);
}

/**
 * 处理响应数据
 */
export function handleResponse<T>(response: AxiosResponse): T {
  const data = response.data as RagFlowResponse<T>;
  
  if (data.code !== 0) {
    throw new Error(`API Error: ${data.message || 'Unknown error'}`);
  }
  
  return data.data as T;
}

/**
 * 创建用于上传文件的FormData
 * 支持浏览器和Node.js环境
 */
export function createFormData(files: string[] | Buffer[] | { content: Buffer, filename: string }[]): FormData {
  const formData = new FormData();
  
  for (const file of files) {
    if (typeof file === 'string') {
      throw new Error('使用文件路径上传需要在调用方引入fs并处理文件流');
    } else if (Buffer.isBuffer(file)) {
      // 处理Buffer类型
      const fileName = 'file.bin';
      formData.append('file', new Blob([file]), fileName);
    } else if (file && 'content' in file && 'filename' in file) {
      // 处理对象类型
      formData.append('file', new Blob([file.content]), file.filename);
    }
  }
  
  return formData;
}

/**
 * 创建查询参数字符串
 */
export function createQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return `${key}=${value ? 'true' : 'false'}`;
      }
      return `${key}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
  
  return query ? `?${query}` : '';
}

/**
 * 处理流式响应
 * 仅支持Node环境
 */
export async function handleStreamResponse<T>(stream: any, onData: (chunk: T) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    let buffer = '';
    
    stream.on('data', (chunk: Buffer) => {
      const chunkStr = chunk.toString();
      buffer += chunkStr;
      
      // 尝试解析每个完整的JSON对象
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);
        
        if (line) {
          try {
            // 处理SSE格式数据，格式为 "data: {json数据}"
            let jsonData = line;
            if (line.startsWith('data:')) {
              jsonData = line.substring(5).trim();
            }
            
            // 检查是否为有效的JSON对象
            if (jsonData && (jsonData.startsWith('{') || jsonData.startsWith('['))) {
              const data = JSON.parse(jsonData);
              onData(data);
            }
          } catch (error) {
            // 忽略无法解析的行，但记录错误以便调试
            console.error('Error parsing JSON:', error, 'Line:', line);
          }
        }
      }
    });
    
    stream.on('end', () => {
      // 处理最后可能的数据
      if (buffer.trim()) {
        try {
          // 同样处理SSE格式
          let jsonData = buffer.trim();
          if (jsonData.startsWith('data:')) {
            jsonData = jsonData.substring(5).trim();
          }
          
          // 检查是否为有效的JSON对象
          if (jsonData && (jsonData.startsWith('{') || jsonData.startsWith('['))) {
            const data = JSON.parse(jsonData);
            onData(data);
          }
        } catch (error) {
          // 忽略无法解析的行
          console.error('Error parsing final JSON buffer:', error);
        }
      }
      resolve();
    });
    
    stream.on('error', (error: Error) => {
      reject(error);
    });
  });
} 