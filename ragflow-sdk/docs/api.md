# RagFlow SDK API文档

本文档详细介绍了RagFlow SDK的API使用方法。

## 初始化客户端

```typescript
import { RagFlowClient } from 'ragflow-sdk';

const client = new RagFlowClient({
  baseUrl: 'http://your-ragflow-server',
  apiKey: 'your-api-key',
  timeout: 30000 // 可选，默认30秒
});
```

## 数据集管理

### 创建数据集

```typescript
const dataset = await client.datasets.create({
  name: 'test_dataset', // 必填
  avatar: 'base64-encoded-avatar', // 可选
  description: '这是一个测试数据集', // 可选
  embedding_model: 'BAAI/bge-large-zh-v1.5', // 可选
  permission: 'me', // 可选，'me'或'team'，默认'me'
  chunk_method: 'naive', // 可选，默认'naive'
  parser_config: { // 可选
    chunk_token_count: 128,
    layout_recognize: true,
    html4excel: false,
    delimiter: '\\n!?;。；！？'
  }
});
```

### 删除数据集

```typescript
// 删除指定ID的数据集
await client.datasets.delete(['dataset_id_1', 'dataset_id_2']);
```

### 更新数据集

```typescript
await client.datasets.update('dataset_id', {
  name: 'updated_dataset',
  embedding_model: 'new_model',
  chunk_method: 'qa'
});
```

### 获取数据集列表

```typescript
const datasets = await client.datasets.list({
  page: 1, // 可选，默认1
  page_size: 30, // 可选，默认30
  orderby: 'create_time', // 可选，'create_time'或'update_time'，默认'create_time'
  desc: true, // 可选，默认true
  name: 'dataset_name', // 可选
  id: 'dataset_id' // 可选
});
```

### 获取单个数据集

```typescript
const dataset = await client.datasets.get('dataset_id');
```

## 文档管理

### 上传文档

从v0.4.0版本开始，文档上传API支持多种输入类型。以下是不同的使用方式：

#### 方式1: 使用带有文件名的Buffer对象

```typescript
// 需要自行导入fs模块
import * as fs from 'fs';
import * as path from 'path';

const filePath = './file.pdf';
const fileBuffer = fs.readFileSync(filePath);
const fileName = path.basename(filePath);

// 上传单个文件
const documents = await client.documents.upload('dataset_id', {
  content: fileBuffer,
  filename: fileName
});
```

#### 方式2: 直接使用Buffer对象

```typescript
// 需要自行导入fs模块
import * as fs from 'fs';

const fileBuffer = fs.readFileSync('./file.pdf');

// 上传单个文件
const documents = await client.documents.upload('dataset_id', fileBuffer);
```

#### 方式3: 使用多个文件上传

```typescript
// 上传多个文件
const documents = await client.documents.create('dataset_id', [
  { content: fs.readFileSync('./file1.pdf'), filename: 'file1.pdf' },
  { content: fs.readFileSync('./file2.txt'), filename: 'file2.txt' }
]);
```

**注意:** 从v0.4.0版本开始，如果使用文件路径字符串，需要在调用代码中自行导入fs模块并处理文件流。

### 更新文档

```typescript
await client.documents.update('dataset_id', 'document_id', {
  name: 'manual.txt',
  meta_fields: { author: 'John Doe' },
  chunk_method: 'manual',
  parser_config: {
    chunk_token_count: 128
  }
});
```

### 下载文档

```typescript
const fileBuffer = await client.documents.download('dataset_id', 'document_id');
// 可以将buffer写入文件系统
import fs from 'fs';
fs.writeFileSync('./downloaded_file.pdf', fileBuffer);
```

### 获取文档列表

```typescript
const documents = await client.documents.list('dataset_id', {
  page: 1, // 可选，默认1
  page_size: 30, // 可选，默认30
  orderby: 'create_time', // 可选，默认'create_time'
  desc: true, // 可选，默认true
  keywords: '关键词', // 可选
  id: 'document_id', // 可选
  name: 'document_name' // 可选
});
```

### 删除文档

```typescript
await client.documents.delete('dataset_id', ['document_id_1', 'document_id_2']);
```

### 解析文档

```typescript
await client.documents.parse('dataset_id', ['document_id_1', 'document_id_2']);
```

### 停止解析文档

```typescript
await client.documents.stopParsing('dataset_id', ['document_id_1', 'document_id_2']);
```

## 文本块管理

### 添加文本块

```typescript
const chunk = await client.chunks.add('dataset_id', 'document_id', {
  content: '这是一个测试文本块', // 必填
  important_keywords: ['关键词1', '关键词2'], // 可选
  questions: ['相关问题1', '相关问题2'] // 可选
});
```

### 获取文本块列表

```typescript
const chunks = await client.chunks.list('dataset_id', 'document_id', {
  keywords: '关键词', // 可选
  page: 1, // 可选，默认1
  page_size: 1024, // 可选，默认1024
  id: 'chunk_id' // 可选
});
```

### 删除文本块

```typescript
await client.chunks.delete('dataset_id', 'document_id', ['chunk_id_1', 'chunk_id_2']);
```

### 更新文本块

```typescript
await client.chunks.update('dataset_id', 'document_id', 'chunk_id', {
  content: '更新后的文本块内容', // 可选
  important_keywords: ['新关键词1', '新关键词2'], // 可选
  available: true // 可选，默认true
});
```

## 检索功能

### 执行检索

```typescript
const results = await client.retrieval.retrieve({
  question: '什么是RagFlow?', // 必填
  dataset_ids: ['dataset_id_1'], // dataset_ids和document_ids至少填一个
  document_ids: ['document_id_1'], // dataset_ids和document_ids至少填一个
  page: 1, // 可选，默认1
  page_size: 30, // 可选，默认30
  similarity_threshold: 0.2, // 可选，默认0.2
  vector_similarity_weight: 0.3, // 可选，默认0.3
  top_k: 1024, // 可选，默认1024
  rerank_id: 'rerank_model_id', // 可选
  keyword: false, // 可选，默认false
  highlight: true // 可选，默认false
});
```

## 聊天完成功能

### 创建聊天完成

```typescript
// 非流式响应
const completion = await client.chat.createCompletion('chat_id', {
  model: 'DeepSeek-V3', // 必填，示例：DeepSeek-V3、GPT-4等
  messages: [ // 必填
    { role: 'system', content: '你是一个有用的AI助手' },
    { role: 'user', content: '你好，这是一个测试问题' }
  ],
  stream: false // 可选，默认false
});

// 流式响应
await client.chat.createCompletion(
  'chat_id',
  {
    model: 'DeepSeek-V3', // 必填，示例：DeepSeek-V3、GPT-4等
    messages: [
      { role: 'system', content: '你是一个有用的AI助手' },
      { role: 'user', content: '你好，这是一个测试问题' }
    ],
    stream: true
  },
  (data) => {
    // 处理流式响应的每个数据块
    if (data.choices && data.choices[0].delta?.content) {
      process.stdout.write(data.choices[0].delta.content);
    }
  }
);
```

## 聊天助手管理

### 创建聊天助手

```typescript
const chatAssistant = await client.chatAssistants.create({
  name: '测试助手', // 必填
  avatar: 'base64-encoded-avatar', // 可选
  dataset_ids: ['dataset_id_1', 'dataset_id_2'], // 可选，关联的数据集ID
  llm: { // 可选，LLM设置
    model_name: 'model_name', // 可选，默认使用用户默认的聊天模型
    temperature: 0.1, // 可选，默认0.1
    top_p: 0.3, // 可选，默认0.3
    presence_penalty: 0.4, // 可选，默认0.2
    frequency_penalty: 0.7, // 可选，默认0.7
    max_tokens: 512 // 可选，默认512
  },
  prompt: { // 可选，提示设置
    similarity_threshold: 0.2, // 可选，默认0.2
    keywords_similarity_weight: 0.3, // 可选，默认0.7
    top_n: 6, // 可选，默认8
    variables: [{ key: 'knowledge', optional: false }], // 可选
    rerank_model: '', // 可选
    empty_response: '抱歉！在知识库中没有找到相关内容！', // 可选
    opener: '您好！我是您的助手，有什么可以帮您的？', // 可选
    show_quote: true, // 可选，默认true
    prompt: '你是一个智能助手...' // 可选，提示词内容
  }
});
```

### 更新聊天助手

```typescript
await client.chatAssistants.update('chat_id', {
  name: '更新后的助手名称',
  dataset_ids: ['new_dataset_id'],
  llm: {
    temperature: 0.2
  },
  prompt: {
    top_n: 8
  }
});
```

### 删除聊天助手

```typescript
await client.chatAssistants.delete(['chat_id_1', 'chat_id_2']);
```

### 获取聊天助手列表

```typescript
const chatAssistants = await client.chatAssistants.list({
  page: 1, // 可选，默认1
  page_size: 30, // 可选，默认30
  orderby: 'create_time', // 可选，默认'create_time'
  desc: true, // 可选，默认true
  name: 'chat_name', // 可选
  id: 'chat_id' // 可选
});
```

### 创建聊天会话

```typescript
const session = await client.chatAssistants.createSession('chat_id', {
  name: '测试会话', // 必填
  user_id: 'custom_user_id' // 可选，自定义用户ID
});
```

### 更新聊天会话

```typescript
await client.chatAssistants.updateSession('chat_id', 'session_id', {
  name: '更新后的会话名称',
  user_id: 'new_user_id' // 可选
});
```

### 获取聊天会话列表

```typescript
const sessions = await client.chatAssistants.listSessions('chat_id', {
  page: 1, // 可选，默认1
  page_size: 30, // 可选，默认30
  orderby: 'create_time', // 可选，默认'create_time'
  desc: true, // 可选，默认true
  name: 'session_name', // 可选
  id: 'session_id', // 可选
  user_id: 'user_id' // 可选
});
```

### 删除聊天会话

```typescript
await client.chatAssistants.deleteSessions('chat_id', ['session_id_1', 'session_id_2']);
```

### 与聊天助手对话

```typescript
// 非流式响应
const response = await client.chatAssistants.converse(
  'chat_id',
  {
    question: '你好，这是一个测试问题', // 必填
    session_id: 'session_id', // 可选，如果不提供则会创建新的会话
    stream: false, // 可选，默认true
    user_id: 'custom_user_id' // 可选，仅当不提供session_id时有效
  }
);

// 流式响应
await client.chatAssistants.converse(
  'chat_id',
  {
    question: '你好，这是一个测试流式响应',
    session_id: 'session_id',
    stream: true
  },
  (data) => {
    // 处理流式响应的每个数据块
    if (data.data && typeof data.data !== 'boolean' && data.data.answer) {
      process.stdout.write(data.data.answer);
    }
  }
);
```

## 代理管理

### 获取代理列表

```typescript
const agents = await client.agents.list({
  page: 1, // 可选，默认1
  page_size: 30, // 可选，默认30
  orderby: 'create_time', // 可选，默认'create_time'
  desc: true, // 可选，默认true
  name: 'agent_name', // 可选
  id: 'agent_id' // 可选
});
```

### 创建代理会话

```typescript
// 不包含文件参数的普通会话创建
const session = await client.agents.createSession('agent_id', {
  user_id: 'custom_user_id', // 可选，自定义用户ID
  // 其他Begin组件指定的参数
  lang: 'English',
  custom_param: '自定义参数'
});

// 包含文件参数的会话创建
const fileBlob = new Blob(['文件内容'], { type: 'text/plain' });
const session = await client.agents.createSession('agent_id', {
  user_id: 'custom_user_id',
  file: fileBlob, // 文件参数
  lang: 'English'
});
```

### 获取代理会话列表

```typescript
const sessions = await client.agents.listSessions('agent_id', {
  page: 1, // 可选，默认1
  page_size: 30, // 可选，默认30
  orderby: 'create_time', // 可选，默认'create_time'
  desc: true, // 可选，默认true
  id: 'session_id', // 可选
  user_id: 'user_id', // 可选
  dsl: true // 可选，是否包含DSL字段，默认true
});
```

### 删除代理会话

```typescript
await client.agents.deleteSessions('agent_id', ['session_id_1', 'session_id_2']);
```

### 与代理对话

```typescript
// 非流式响应
const response = await client.agents.converse(
  'agent_id',
  {
    question: '你好，请介绍一下你能做什么', // 必填，如果是首次对话且没有session_id则会创建新的会话
    session_id: 'session_id', // 可选，如果不提供则会创建新的会话
    stream: false, // 可选，默认true
    user_id: 'custom_user_id', // 可选，仅当不提供session_id时有效
    sync_dsl: false, // 可选，是否同步DSL变更到会话，默认false
    // 其他Begin组件指定的参数（如果是首次对话且没有session_id）
    lang: 'English',
    custom_param: '自定义参数'
  }
);

// 流式响应
await client.agents.converse(
  'agent_id',
  {
    question: '请给我提供一些使用建议',
    session_id: 'session_id',
    stream: true
  },
  (data) => {
    // 处理流式响应的每个数据块
    if (data.data && typeof data.data !== 'boolean' && data.data.answer) {
      process.stdout.write(data.data.answer);
    }
  }
);
``` 