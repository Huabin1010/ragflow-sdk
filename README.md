# RagFlow 项目

RagFlow 是一个强大的 RAG (Retrieval-Augmented Generation) 解决方案，提供了完整的 SDK 和示例项目，帮助开发者快速构建基于 RAG 的应用。

## 项目结构

本仓库包含以下主要组件：

- `ragflow-sdk/`: TypeScript SDK，用于与 RagFlow API 进行交互
- `ragflow-nextjs-demo/`: 基于 Next.js 的示例项目，展示如何在实际应用中使用 RagFlow SDK

## RagFlow SDK

RagFlow SDK 是一个用于与 RagFlow API 交互的 TypeScript 库，提供了简单易用的接口来管理和使用 RagFlow 的 RAG 功能。

### 主要功能

- 数据集管理：创建和管理文档数据集
- 文档处理：支持文档上传和解析
- 智能检索：基于问题检索相关文档片段
- 聊天功能：支持流式和非流式聊天完成
- 聊天助手：管理和使用预配置的聊天助手

### 安装

```bash
npm i @qzsy/ragflow-sdk
```

### 基本使用

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
  return dataset;
}

// 上传文档
async function uploadDocument(datasetId: string) {
  const fileObject = { 
    content: fileBuffer, 
    filename: 'sample.pdf' 
  };
  
  const document = await client.documents.upload(datasetId, fileObject);
  return document;
}
```

更多详细用法请参考 [SDK 文档](ragflow-sdk/README.md)。

## Next.js 示例项目

`ragflow-nextjs-demo` 是一个基于 Next.js 的完整示例项目，展示了如何在实际 Web 应用中集成和使用 RagFlow SDK。

### 运行示例项目

1. 进入示例项目目录：
```bash
cd ragflow-nextjs-demo
```

2. 安装依赖：
```bash
npm install
# 或
yarn
# 或
pnpm install
```

3. 启动开发服务器：
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看示例应用。

## 更新日志

请参考各个子项目的 README 文件获取详细的更新日志：

- [SDK 更新日志](ragflow-sdk/README.md#更新日志)
- [示例项目更新日志](ragflow-nextjs-demo/README.md)

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。 