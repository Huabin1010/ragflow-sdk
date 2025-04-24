import { RagFlowClient } from "@qzsy/ragflow-sdk";

// SDK客户端配置
export const ragflowConfig = {
  baseUrl: "http://192.168.1.75:3000",
  apiKey: "ragflow-YzNWUyNTM0MTU1MjExZjA4NTNjNzJmYz",
};

// 创建SDK客户端单例
export const getClient = (() => {
  let client: RagFlowClient | null = null;
  
  return () => {
    if (!client) {
      client = new RagFlowClient(ragflowConfig);
    }
    return client;
  };
})();

// 模拟数据集数据
export const mockDatasets = [
  {
    id: "1a2b3c4d5e6f7g8h9i0j",
    name: "公司产品手册",
    document_count: 5,
    chunk_count: 120,
    embedding_model: "BAAI/bge-m3",
    description: "包含公司所有产品的详细技术规格和使用说明"
  },
  {
    id: "2b3c4d5e6f7g8h9i0j1k",
    name: "行业研究报告",
    document_count: 8,
    chunk_count: 215,
    embedding_model: "BAAI/bge-m3",
    description: "收集了近三年的行业研究分析报告和市场趋势预测"
  },
  {
    id: "3c4d5e6f7g8h9i0j1k2l",
    name: "客户服务手册",
    document_count: 3,
    chunk_count: 87,
    embedding_model: "BAAI/bge-m3",
    description: "客户服务流程、常见问题解答和处理指南"
  }
];

// 模拟文档数据
export const mockDocuments = {
  "1a2b3c4d5e6f7g8h9i0j": [
    {
      id: "doc1-1a2b3c4d",
      name: "产品A技术规格说明书.pdf",
      size: 1245678,
      chunk_count: 32,
      status: "done",
      created_at: "2023-12-15T08:35:22Z"
    },
    {
      id: "doc2-1a2b3c4d",
      name: "产品B用户手册.docx",
      size: 985432,
      chunk_count: 26,
      status: "done",
      created_at: "2023-12-16T10:22:15Z"
    },
    {
      id: "doc3-1a2b3c4d",
      name: "产品C安装指南.pdf",
      size: 756234,
      chunk_count: 18,
      status: "done",
      created_at: "2023-12-18T14:45:30Z"
    }
  ]
};

// 模拟文本块数据
export const mockChunks = {
  "doc1-1a2b3c4d": [
    {
      id: "chunk1-doc1",
      content: "产品A是我们公司最新研发的智能办公解决方案。它采用先进的人工智能技术，能够自动识别和处理文档，提高办公效率。主要特点包括：1. 智能文档分类；2. 自动信息提取；3. 多语言支持；4. 云端存储与协作。",
      metadata: {
        page: 1,
        source: "产品A技术规格说明书.pdf"
      }
    },
    {
      id: "chunk2-doc1",
      content: "技术规格：\n- 处理器: 第8代Intel Core i7\n- 内存: 16GB DDR4\n- 存储: 512GB SSD\n- 显示器: 15.6英寸4K触控屏\n- 电池: 10小时续航\n- 操作系统: Windows 11 Pro",
      metadata: {
        page: 2,
        source: "产品A技术规格说明书.pdf"
      }
    },
    {
      id: "chunk3-doc1",
      content: "软件功能：产品A预装了我们自主研发的RagFlow办公套件，包括文档管理系统、协作平台和知识库管理工具。用户可以通过这些工具高效地管理文档、与团队协作以及构建企业知识库。",
      metadata: {
        page: 3,
        source: "产品A技术规格说明书.pdf"
      }
    }
  ]
};

// 模拟检索结果
export const mockRetrievalResults = {
  "产品功能": {
    total: 3,
    chunks: [
      {
        id: "chunk1-doc1",
        content: "产品A是我们公司最新研发的智能办公解决方案。它采用先进的人工智能技术，能够自动识别和处理文档，提高办公效率。主要特点包括：1. 智能文档分类；2. 自动信息提取；3. 多语言支持；4. 云端存储与协作。",
        similarity: 0.92,
        metadata: {
          source: "产品A技术规格说明书.pdf",
          page: 1
        }
      },
      {
        id: "chunk3-doc1",
        content: "软件功能：产品A预装了我们自主研发的RagFlow办公套件，包括文档管理系统、协作平台和知识库管理工具。用户可以通过这些工具高效地管理文档、与团队协作以及构建企业知识库。",
        similarity: 0.89,
        metadata: {
          source: "产品A技术规格说明书.pdf",
          page: 3
        }
      },
      {
        id: "chunk-doc2-1",
        content: "产品B是一款专为团队协作设计的软件平台。它集成了项目管理、任务分配、进度跟踪和资源规划等功能，使团队能够更高效地完成工作。",
        similarity: 0.85,
        metadata: {
          source: "产品B用户手册.docx",
          page: 1
        }
      }
    ]
  }
};

// 模拟聊天助手数据
export const mockChatAssistants = [
  {
    id: "chatbot-1",
    name: "产品顾问",
    description: "能够回答关于公司产品功能、特点和使用方法的问题",
    model: "DeepSeek-V3",
    created_at: "2023-11-05T09:22:11Z"
  },
  {
    id: "chatbot-2",
    name: "技术支持",
    description: "提供技术问题解答和故障排除指导",
    model: "DeepSeek-V3",
    created_at: "2023-11-06T14:38:55Z"
  }
];

// 模拟聊天历史
export const mockChatHistory = {
  "chatbot-1": [
    {
      role: "user",
      content: "你能告诉我产品A的主要功能有哪些吗？",
      timestamp: "2023-12-20T10:15:22Z"
    },
    {
      role: "assistant",
      content: "产品A是我们公司最新研发的智能办公解决方案，它的主要功能有：\n\n1. 智能文档分类 - 自动对上传的文档进行分类整理\n2. 自动信息提取 - 识别并提取文档中的关键信息\n3. 多语言支持 - 支持多达15种语言的文档处理\n4. 云端存储与协作 - 团队成员可以同时在云端访问和编辑文档\n\n此外，产品A还预装了我们自主研发的RagFlow办公套件，包括文档管理系统、协作平台和知识库管理工具，帮助您构建企业知识库。",
      timestamp: "2023-12-20T10:15:32Z"
    },
    {
      role: "user",
      content: "产品A的系统要求是什么？",
      timestamp: "2023-12-20T10:16:05Z"
    },
    {
      role: "assistant",
      content: "产品A的系统要求如下：\n\n- 处理器: 至少第8代Intel Core i5或同等性能的处理器\n- 内存: 最低8GB RAM，推荐16GB\n- 存储: 至少256GB可用空间，推荐SSD存储\n- 显示器: 1920x1080分辨率或更高\n- 操作系统: Windows 10/11 64位, macOS 10.15或更高版本\n- 网络: 宽带互联网连接\n\n如果您需要运行更高级的AI功能，我们建议使用配备独立显卡的计算机以获得更好的性能。",
      timestamp: "2023-12-20T10:16:18Z"
    }
  ]
};

// 模拟智能代理数据
export const mockAgents = [
  {
    id: "agent-1",
    title: "销售助手",
    description: "能够回答产品询问、生成报价单，并帮助客户选择合适的产品",
    model: "DeepSeek-V3",
    created_at: "2023-11-15T11:22:33Z",
    tools: ["产品目录查询", "价格计算器", "客户需求分析"]
  },
  {
    id: "agent-2",
    title: "数据分析师",
    description: "帮助分析业务数据，生成报表，并提供决策建议",
    model: "DeepSeek-V3",
    created_at: "2023-11-18T09:45:12Z",
    tools: ["数据可视化", "趋势分析", "预测模型"]
  }
];

// 模拟代理会话数据
export const mockAgentSessions = {
  "agent-1": [
    {
      id: "session-a1-1",
      created_at: "2023-12-21T08:30:15Z",
      updated_at: "2023-12-21T08:45:22Z",
      name: "客户咨询-王先生"
    },
    {
      id: "session-a1-2",
      created_at: "2023-12-22T14:12:33Z",
      updated_at: "2023-12-22T14:30:45Z",
      name: "产品演示-李女士"
    }
  ]
};

// 模拟代理对话
export const mockAgentConversations = {
  "session-a1-1": [
    {
      role: "user",
      content: "我想了解一下你们的产品，我们公司需要一个文档管理系统",
      timestamp: "2023-12-21T08:30:30Z"
    },
    {
      role: "agent",
      content: "您好！很高兴为您服务。根据您的需求，我们有两款产品可能适合您：\n\n1. 产品A - 智能办公解决方案，包含全面的文档管理系统，适合中大型企业\n2. 产品B - 协作平台，有基础的文档管理功能，适合小型团队\n\n请问您公司的规模大概是多少人？您对文档管理有什么特别的需求吗？",
      timestamp: "2023-12-21T08:30:45Z",
      thinking: "客户需要文档管理系统，我们有产品A和产品B都包含此功能，但针对不同规模企业，需要了解更多信息来推荐合适的产品。"
    },
    {
      role: "user",
      content: "我们公司有大约200人，主要需要管理技术文档和客户资料，要求有良好的搜索功能",
      timestamp: "2023-12-21T08:32:10Z"
    },
    {
      role: "agent",
      content: "非常感谢您提供的信息。对于一个200人规模的公司，尤其是需要管理技术文档和客户资料，我强烈推荐我们的产品A智能办公解决方案。\n\n产品A特别适合您的需求，因为：\n\n1. 它的智能文档分类功能可以自动整理技术文档和客户资料\n2. 搜索功能非常强大，采用了先进的语义搜索技术，能够理解搜索意图\n3. 支持复杂的权限管理，确保客户资料的安全性\n4. 自带知识库功能，可以构建公司内部技术知识库\n\n我可以为您安排一个产品A的演示，让您更直观地了解它的功能。您有兴趣吗？",
      timestamp: "2023-12-21T08:32:45Z",
      thinking: "客户公司规模200人，属于中型企业，且需要管理技术文档和客户资料，需要强大的搜索功能。产品A更适合，因为它有高级的文档管理和搜索功能，特别是语义搜索技术。"
    }
  ]
}; 