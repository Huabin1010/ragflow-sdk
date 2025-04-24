# RagFlow SDK 0.4.0 发布说明

发布日期：2024年11月7日

## 主要变更

### 移除核心代码对Node.js fs模块的依赖

在此版本中，我们重构了SDK的核心代码，移除了对Node.js特有的`fs`模块的直接依赖。这一变更提高了SDK在不同JavaScript环境中的兼容性，如浏览器或非Node.js环境。

### 文件上传API增强

- `createFormData`函数现在支持以下输入类型：
  - Buffer对象
  - 包含content(Buffer)和filename属性的对象
  - 文件路径字符串（仅在调用环境中引入fs模块时可用）

- `DocumentsAPI`的上传方法已更新：
  - `create()`方法支持多种文件输入类型
  - `upload()`方法根据输入类型自动处理文件

## 兼容性提示

如果您之前使用文件路径字符串进行文档上传，现在需要在您的代码中确保导入了`fs`模块：

```javascript
// 您的应用代码中
import * as fs from 'fs';
import * as path from 'path';
import { RagFlowClient } from '@qzsy/ragflow-sdk';

const client = new RagFlowClient({...});

// 使用文件路径方式 - 需要在您的代码中自行处理文件流
const filePath = './document.pdf';
const fileObject = { 
  content: fs.readFileSync(filePath), 
  filename: path.basename(filePath) 
};
await client.documents.upload(datasetId, fileObject);
```

## 测试覆盖

所有测试用例已更新，以适应新的API变更。`fs`模块的使用现在仅限于测试代码中。 