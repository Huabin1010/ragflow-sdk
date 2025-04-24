# RagFlow SDK 测试

本目录包含 RagFlow SDK 的测试代码。

## 测试类型

SDK 包含两种主要的测试类型：

1. **单元测试**：使用 Jest 框架进行的模拟测试，不需要实际的 RagFlow 服务端
2. **真实环境测试**：与真实的 RagFlow API 交互的测试，需要有效的 API 密钥和可访问的 RagFlow 服务

## 运行测试

### 单元测试

运行所有单元测试：

```bash
npm test
```

### 真实环境测试

运行所有真实环境测试：

```bash
npm run test:real
```

您可以选择只运行特定类型的测试：

```bash
# 只测试数据集相关功能
npm run test:datasets

# 只测试文档上传功能
npm run test:upload

# 只测试流式响应功能
npm run test:stream

# 只测试聊天助手功能
npm run test:assistants

# 只测试代理功能
npm run test:agents
```

也可以使用命令行参数指定多个测试模块：

```bash
# 同时测试数据集和检索功能
npm run test:real -- --tests=datasets,retrieval
```

## 配置测试环境

### 使用环境变量

真实环境测试会自动尝试从 `.env` 文件加载配置。您可以在项目根目录创建一个 `.env` 文件，内容如下：

```
# RagFlow API 服务地址
RAGFLOW_API_URL=http://your-ragflow-server:8000

# RagFlow API 密钥
RAGFLOW_API_KEY=your-api-key

# 测试配置（可选）
RAGFLOW_TEST_VERBOSE=true
```

### 使用命令行环境变量

您也可以在命令行中直接设置环境变量：

```bash
# Linux/MacOS
export RAGFLOW_API_URL=http://your-ragflow-server:8000
export RAGFLOW_API_KEY=your-api-key
npm run test:real

# Windows (CMD)
set RAGFLOW_API_URL=http://your-ragflow-server:8000
set RAGFLOW_API_KEY=your-api-key
npm run test:real

# Windows (PowerShell)
$env:RAGFLOW_API_URL="http://your-ragflow-server:8000"
$env:RAGFLOW_API_KEY="your-api-key"
npm run test:real
```

## 测试内容

真实环境测试会测试以下模块的功能：

1. **数据集管理**：创建、查询、删除数据集
2. **文档管理**：上传、解析、查询文档
3. **文本块管理**：查询、添加文本块
4. **检索功能**：基于问题的文本块检索
5. **聊天助手**：聊天助手的创建、会话管理和对话
6. **代理**：代理的会话创建和对话
7. **流式响应**：测试各模块的流式响应功能

## 注意事项

1. 运行真实环境测试需要有效的 API 密钥和可访问的 RagFlow 服务
2. 测试过程中会创建和删除资源，请确保使用测试环境或非生产环境
3. 测试时可能会产生额外的 API 调用费用（如果您的 RagFlow 服务是计费的）
4. 某些测试（如文档解析）可能需要较长时间，请耐心等待
5. 出于安全考虑，请不要将您的 API 密钥提交到代码仓库中，建议使用 `.env` 文件（已在 `.gitignore` 中忽略） 