# RagFlow SDK

RagFlow SDK是一个用于与RagFlow API交互的TypeScript库，提供了简单易用的接口来管理和使用RagFlow的RAG(Retrieval-Augmented Generation)功能。

## 更新日志

### v0.4.0 (2024-11-07)
- **重大改进**: 从SDK核心代码中移除对Node.js `fs`模块的直接依赖
- **重要特性**: 文件上传API现在支持多种输入类型(Buffer对象、包含文件名的对象等)
- **优化**: 将文件系统操作限制在测试代码中，提高在不同JavaScript环境中的兼容性

### v0.3.0 (2024-08-XX)
- **重大改进**: 重构HTTP客户端实现，不再直接使用AxiosInstance
- **重要特性**: 使用自定义HttpClient类和单例模式，避免与项目中已有Axios实例冲突
- **重要修复**: 修正所有API的HTTP方法，确保DELETE请求正确发送请求体数据
- **修复**: 修正了会话删除API的路径和请求方法问题
- **兼容性**: 保留对原有上传和解析文档方法的向后兼容支持

### v0.2.7 (2024-07-XX)
- **重要修复**: 修正聊天完成API路径，解决404 Not Found错误
- **重要改进**: 移除默认实例导出，防止单例模式导致的污染问题
- 调整代码结构，避免跨项目状态共享

### v0.2.6 (2024-07-XX)
- **重要修复**: 修正所有文档管理相关API路径，由`/docs`改为`/documents`
- **修复**: 修正文档解析API路径和参数
- 解决404 Not Found错误问题

### v0.2.5 (2024-07-XX)
- **修复**: 修正文档上传方法返回类型错误
- **修复**: 移除代理会话创建中对File和Blob类型的处理
- **修复**: 修正流式响应相关代码中的多余注释
- 进一步清理与浏览器兼容性相关的代码

### v0.2.4 (2024-07-XX)
- **重大变更**: 移除所有浏览器环境支持
- 删除浏览器兼容性代码和构建流程
- 简化代码结构，专注于Node.js环境

### v0.2.3 (2024-07-XX)
- **修复**: 解决handleStreamResponse函数中的语法错误问题
- 彻底重写浏览器环境下的流处理逻辑，确保语法有效
- 增加代码块匹配验证，自动修复结构不匹配问题
- 进一步优化浏览器兼容性代码生成流程

### v0.2.2 (2024-07-XX)
- **修复**: 解决浏览器版本中的语法错误问题（"Parsing ecmascript source code failed"）
- 优化浏览器兼容性构建脚本，彻底移除Node.js相关代码
- 增强打包文件的JavaScript语法有效性

### v0.2.1 (2024-07-XX)
- **修复**: 解决了在Next.js、webpack等环境下出现的"Module not found: Can't resolve 'fs'"错误
- 改进了浏览器环境下的模块处理方式，更加兼容
- 进一步优化了用于浏览器的打包配置

### v0.2.0 (2024-07-XX)
- **重大特性**: 增加浏览器环境支持，现在可以在浏览器中直接使用SDK
- 添加文件上传的浏览器兼容性，支持File对象上传
- 优化流式响应处理，支持浏览器环境中的流式聊天
- 添加跨域请求配置选项withCredentials
- 文档下载功能现在在浏览器中返回Blob对象，在Node中返回Buffer
- 完善了文档，添加了浏览器环境的使用示例

### v0.1.1
- 初始版本发布

## 安装

```bash
npm i @qzsy/ragflow-sdk
```

## 使用示例

```typescript
import { RagFlowClient } from 'ragflow-sdk';

// 初始化客户端
const client = new RagFlowClient({
  baseUrl: 'http://your-ragflow-server',
  apiKey: 'your-api-key'
});

// 创建数据集
async function createDataset() {
  const dataset = await client.datasets.create({
    name: 'test_dataset'
  });
  console.log('Created dataset:', dataset);
  return dataset;
}

// 上传文档 - 方法1：使用Buffer对象
async function uploadDocumentWithBuffer(datasetId: string) {
  // 注意：如果使用文件路径，需要在您的代码中导入fs模块
  import * as fs from 'fs';
  import * as path from 'path';
  
  const filePath = './sample.pdf';
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  
  const fileObject = { 
    content: fileBuffer, 
    filename: fileName 
  };
  
  const document = await client.documents.upload(datasetId, fileObject);
  console.log('Uploaded document:', document);
  return document;
}

// 上传文档 - 方法2：直接使用Buffer
async function uploadDocumentWithRawBuffer(datasetId: string) {
  import * as fs from 'fs';
  
  const fileBuffer = fs.readFileSync('./sample.pdf');
  const document = await client.documents.upload(datasetId, fileBuffer);
  console.log('Uploaded document:', document);
  return document;
}

// 解析文档
async function parseDocument(datasetId: string, documentId: string) {
  await client.documents.parse(datasetId, [documentId]);
  console.log('Document parsing started');
}

// 检索
async function retrieveChunks(datasetId: string) {
  const chunks = await client.retrieval.retrieve({
    question: '什么是RagFlow?',
    dataset_ids: [datasetId]
  });
  console.log('Retrieved chunks:', chunks);
  return chunks;
}

// 聊天完成
async function chatCompletion(chatId: string) {
  const completion = await client.chat.createCompletion(chatId, {
    model: 'DeepSeek-V3', // 根据实际可用模型调整
    messages: [
      { role: 'system', content: '你是一个有用的AI助手' },
      { role: 'user', content: '介绍一下RagFlow的功能' }
    ],
    stream: false
  });
  console.log('Completion:', completion);
  return completion;
}

// 流式聊天
async function streamChatCompletion(chatId: string) {
  await client.chat.createCompletion(
    chatId,
    {
      model: 'DeepSeek-V3', // 根据实际可用模型调整
      messages: [
        { role: 'system', content: '你是一个有用的AI助手' },
        { role: 'user', content: '请详细介绍RagFlow的主要功能和应用场景' }
      ],
      stream: true
    },
    (data) => {
      if (data.choices && data.choices[0].delta?.content) {
        const content = data.choices[0].delta.content;
        process.stdout.write(content);
      }
    }
  );
}

// 使用聊天助手
async function useChatAssistant() {
  // 获取聊天助手列表
  const assistants = await client.chatAssistants.list();
  
  if (assistants.length > 0) {
    const assistant = assistants[0];
    
    // 创建会话
    const session = await client.chatAssistants.createSession(assistant.id, {
      name: '测试会话'
    });
    
    // 发送问题
    const response = await client.chatAssistants.converse(
      assistant.id,
      {
        question: '你能简单介绍一下你是什么助手吗？',
        session_id: session.id,
        stream: false
      }
    );
    
    console.log('Assistant response:', response.answer);
    
    // 删除会话
    await client.chatAssistants.deleteSessions(assistant.id, [session.id]);
  }
}

// 使用智能代理
async function useAgent() {
  // 获取代理列表
  const agents = await client.agents.list();
  
  if (agents.length > 0) {
    const agent = agents[0];
    
    // 创建会话
    const session = await client.agents.createSession(agent.id);
    
    // 发送问题
    const response = await client.agents.converse(
      agent.id,
      {
        question: '你好，你是什么代理？',
        session_id: session.id,
        stream: false
      }
    );
    
    console.log('Agent response:', response.answer);
    
    // 删除会话
    await client.agents.deleteSessions(agent.id, [session.id]);
  }
}
```

## API

SDK提供以下主要功能模块：

- `datasets`: 数据集管理
- `documents`: 文档管理
- `chunks`: 文本块管理
- `retrieval`: 检索功能
- `chat`: 聊天完成
- `chatAssistants`: 聊天助手管理
- `agents`: 智能代理管理

## 许可

MIT 