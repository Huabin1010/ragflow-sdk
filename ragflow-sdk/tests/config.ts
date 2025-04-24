/**
 * RagFlow SDK 测试配置
 * 
 * 此配置文件允许控制运行哪些测试模块
 * 
 * 使用方法:
 * 可以通过命令行参数 --tests 指定要运行的测试:
 * 
 * 例如:
 * - 运行所有测试: npm run test:real
 * - 仅运行数据集和检索测试: npm run test:real -- --tests=datasets,retrieval
 * - 仅运行流式响应测试: npm run test:real -- --tests=stream
 */

import * as fs from 'fs';
import * as path from 'path';

// 尝试加载 .env 文件中的环境变量
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .forEach(line => {
          const [key, value] = line.split('=').map(part => part.trim());
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        });
      console.log('已加载 .env 文件');
    } catch (err) {
      console.warn('无法加载 .env 文件:', err);
    }
  } else {
    console.warn('未找到 .env 文件。请创建 .env 文件并配置必要的环境变量: RAGFLOW_API_URL 和 RAGFLOW_API_KEY');
  }
}

// 尝试加载环境变量
loadEnvFile();

export interface TestConfig {
  baseUrl: string;
  apiKey: string;
  runTests: {
    datasets: boolean;
    documentUpload: boolean;
    retrieval: boolean;
    streamResponse: boolean;
    chatAssistants: boolean;
    agents: boolean;
    chatCompletion: boolean;
  };
}

/**
 * 解析命令行参数，以确定要运行哪些测试
 */
export function parseTestArgs(): string[] {
  const args = process.argv.slice(2);
  let testsArg = '';
  
  for (const arg of args) {
    if (arg.startsWith('--tests=')) {
      testsArg = arg.substring('--tests='.length);
      break;
    }
  }
  
  if (!testsArg) {
    // 如果未指定测试，则运行所有测试
    return ['all'];
  }
  
  return testsArg.split(',').map(t => t.trim().toLowerCase());
}

/**
 * 获取测试配置
 */
export function getTestConfig(): TestConfig {
  const testsToRun = parseTestArgs();
  const runAll = testsToRun.includes('all');
  
  // 检查必要的环境变量
  const baseUrl = process.env.RAGFLOW_API_URL;
  const apiKey = process.env.RAGFLOW_API_KEY;
  
  // 验证环境变量是否已设置
  if (!baseUrl) {
    console.error('错误: 未设置 RAGFLOW_API_URL 环境变量');
    console.error('请在 .env 文件中添加: RAGFLOW_API_URL=你的API地址');
    console.error('例如: RAGFLOW_API_URL=http://localhost:8000');
  }
  
  if (!apiKey) {
    console.error('错误: 未设置 RAGFLOW_API_KEY 环境变量');
    console.error('请在 .env 文件中添加: RAGFLOW_API_KEY=你的API密钥');
    console.error('例如: RAGFLOW_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  }
  
  if (!baseUrl || !apiKey) {
    console.error('测试可能会失败! 请设置所有必要的环境变量后再运行测试。');
  }
  
  return {
    // 连接配置
    baseUrl: baseUrl || '',
    apiKey: apiKey || '',
    
    // 确定要运行的测试
    runTests: {
      datasets: runAll || testsToRun.includes('datasets'),
      documentUpload: runAll || testsToRun.includes('upload') || testsToRun.includes('document'),
      retrieval: runAll || testsToRun.includes('retrieval'),
      streamResponse: runAll || testsToRun.includes('stream'),
      chatAssistants: runAll || testsToRun.includes('assistant') || testsToRun.includes('chatassistant'),
      agents: runAll || testsToRun.includes('agent'),
      chatCompletion: runAll || testsToRun.includes('chat') || testsToRun.includes('completion'),
    }
  };
} 