import { RagFlowClient } from "../src";
import * as fs from 'fs';
import * as path from 'path';
import { TestConfig, getTestConfig } from './config';

// 获取测试配置
const config = getTestConfig();
const client = new RagFlowClient({
  baseUrl: config.baseUrl,
  apiKey: config.apiKey,
});

// 常用工具函数
function printSeparator(title: string) {
  console.log("\n" + "=".repeat(30));
  console.log(`${title}`);
  console.log("=".repeat(30));
}

// 数据集测试
async function testDatasets() {
  printSeparator("测试数据集功能");
  
  try {
    // 获取数据集列表
    console.log("获取数据集列表...");
    const datasets = await client.datasets.list();
    console.log(`共找到 ${datasets.length} 个数据集`);
    
    if (datasets.length > 0) {
      // 显示第一个数据集信息
      const firstDataset = datasets[0];
      console.log(`数据集信息: ${firstDataset.name} (${firstDataset.id})`);
      console.log(`  - 文档数量: ${firstDataset.document_count}`);
      console.log(`  - 块数量: ${firstDataset.chunk_count}`);
      console.log(`  - 嵌入模型: ${firstDataset.embedding_model}`);
      
      // 获取文档列表
      if (firstDataset.document_count > 0) {
        console.log("\n获取文档列表...");
        const documents = await client.documents.list(firstDataset.id);
        console.log(`共找到 ${documents.docs.length} 个文档`);
        
        if (documents.docs.length > 0) {
          const doc = documents.docs[0];
          console.log(`文档信息: ${doc.name} (${doc.id})`);
          console.log(`  - 大小: ${doc.size} 字节`);
          console.log(`  - 块数量: ${doc.chunk_count}`);
          
          // 获取文本块列表
          if (doc.chunk_count > 0) {
            console.log("\n获取文本块列表...");
            const chunks = await client.chunks.list(firstDataset.id, doc.id);
            console.log(`共找到 ${chunks.chunks.length} 个文本块`);
            
            if (chunks.chunks.length > 0) {
              const chunk = chunks.chunks[0];
              console.log(`文本块内容 (前100字符): ${chunk.content.substring(0, 100)}...`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("数据集测试出错:", err);
  }
}

// 文档上传测试
async function testDocumentUpload() {
  printSeparator("测试文档上传功能");
  
  try {
    // 创建测试数据集
    console.log("创建测试数据集...");
    const testDataset = await client.datasets.create({
      name: `测试数据集-${new Date().toISOString().substring(0, 19).replace(/:/g, '-')}`,
      chunk_method: 'naive',
      embedding_model: 'BAAI/bge-m3'
    });
    console.log(`数据集创建成功: ${testDataset.name} (${testDataset.id})`);
    
    // 创建一个临时测试文件
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    const testContent = `这是一个RagFlow SDK测试文档。
    
RagFlow是一个强大的RAG (检索增强生成) 系统，可以帮助用户构建基于自有数据的AI应用。
主要功能包括：
1. 文档上传与管理
2. 文本块管理
3. 知识库检索
4. 聊天助手
5. 智能代理

测试时间: ${new Date().toISOString()}`;

    fs.writeFileSync(testFilePath, testContent, 'utf8');
    console.log(`测试文件已创建: ${testFilePath}`);
    
    // 上传文档 - 方式1：使用文件路径（在测试环境下，需要显式创建文件流）
    console.log("\n上传文档方式1（使用文件路径）...");
    // 创建文件流并包装为符合API要求的格式
    const fileStream = fs.createReadStream(testFilePath);
    const fileName = path.basename(testFilePath);
    const fileObject = { content: fs.readFileSync(testFilePath), filename: fileName };
    
    const uploadResult = await client.documents.upload(testDataset.id, fileObject);
    console.log(`文档上传成功: ${uploadResult[0].name} (${uploadResult[0].id})`);
    
    // 解析文档
    console.log("\n解析文档...");
    await client.documents.parse(testDataset.id, [uploadResult[0].id]);
    console.log("文档解析请求已发送");
    
    // 等待解析完成(实际环境可能需要更长时间)
    console.log("\n等待文档解析完成...");
    let isComplete = false;
    let retriesLeft = 10;
    let documentDetail;
    
    while (!isComplete && retriesLeft > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const documents = await client.documents.list(testDataset.id);
      documentDetail = documents.docs.find(d => d.id === uploadResult[0].id);
      // console.log(JSON.stringify(documentDetail)); // 注释掉完整JSON的打印
      
      
      if (documentDetail && (documentDetail.status === 'done' || documentDetail.run === 'DONE')) {
        isComplete = true;
        console.log("文档解析完成!");
      } else {
        console.log(`文档解析中... 状态: ${documentDetail?.status || '未知'}, 运行状态: ${documentDetail?.run || '未知'}, 进度: ${(documentDetail?.progress || 0) * 100}%`);
        retriesLeft--;
      }
    }
    
    if (isComplete && documentDetail) {
      // 获取文本块
      console.log("\n获取解析后的文本块...");
      const chunks = await client.chunks.list(testDataset.id, documentDetail.id);
      console.log(`共生成 ${chunks.chunks.length} 个文本块`);
      
      if (chunks.chunks.length > 0) {
        // 展示文本块内容
        console.log("\n文本块内容示例:");
        chunks.chunks.forEach((chunk, index) => {
          console.log(`[${index + 1}] ${chunk.content.substring(0, 100)}...`);
        });
      }
      
      // 尝试检索
      console.log("\n对新上传文档进行检索测试...");
      const results = await client.retrieval.retrieve({
        question: "RagFlow有哪些功能？",
        dataset_ids: [testDataset.id],
        similarity_threshold: 0.1
      });
      
      console.log(`检索结果: ${results.total} 条匹配`);
      if (results.chunks && results.chunks.length > 0) {
        console.log("\n检索到的内容:");
        results.chunks.forEach((chunk, index) => {
          console.log(`[${index + 1}] 相似度: ${chunk.similarity.toFixed(4)}`);
          console.log(`内容: ${chunk.content}`);
        });
      }
    } else {
      console.log("文档解析超时或失败，跳过后续检索测试");
    }
    
    // 清理测试文件
    fs.unlinkSync(testFilePath);
    console.log("\n测试文件已删除");
    
    // 清理测试数据集
    console.log("\n删除测试数据集...");
    await client.datasets.delete([testDataset.id]);
    console.log("测试数据集删除成功");
    
  } catch (err) {
    console.error("文档上传测试出错:", err);
  }
}

// 检索测试
async function testRetrieval() {
  printSeparator("测试检索功能");
  
  try {
    // 获取数据集列表
    const datasets = await client.datasets.list();
    
    if (datasets.length > 0) {
      const datasetId = datasets[0].id;
      console.log(`使用数据集: ${datasets[0].name} (${datasetId})`);
      
      // 执行检索
      console.log("\n执行检索...");
      const results = await client.retrieval.retrieve({
        question: "RagFlow是什么？",
        dataset_ids: [datasetId],
        similarity_threshold: 0.1,
        highlight: true
      });
      
      console.log(`检索结果: ${results.total} 条匹配`);
      
      if (results.chunks && results.chunks.length > 0) {
        console.log("\n检索到的内容示例:");
        results.chunks.slice(0, 2).forEach((chunk, index) => {
          console.log(`[${index + 1}] 相似度: ${chunk.similarity.toFixed(4)}`);
          console.log(`内容: ${chunk.content.substring(0, 150)}...`);
          console.log("");
        });
      }
    } else {
      console.log("未找到数据集，跳过检索测试");
    }
  } catch (err) {
    console.error("检索测试出错:", err);
  }
}

// 流式响应测试
async function testStreamResponse() {
  printSeparator("测试流式响应功能");
  
  try {
    // 流式聊天完成测试
    console.log("测试流式聊天完成...");
    
    let responseText = "";
    const streamStartTime = Date.now();
    
    await client.chat.createCompletion(
      "test-stream", 
      {
        model: "DeepSeek-V3", // 请根据实际可用模型调整
        messages: [
          { role: "system", content: "你是一个有用的AI助手，请提供详细的回答" },
          { role: "user", content: "请详细介绍RagFlow的主要功能和应用场景" }
        ],
        stream: true
      },
      (data) => {
        if (data.choices && data.choices[0].delta?.content) {
          const content = data.choices[0].delta.content;
          responseText += content;
          process.stdout.write(content);
        }
      }
    );
    
    const streamDuration = ((Date.now() - streamStartTime) / 1000).toFixed(2);
    console.log(`\n\n流式聊天完成测试完成，耗时 ${streamDuration} 秒`);
    console.log(`总共接收到 ${responseText.length} 个字符`);
    
    // 测试流式聊天助手
    console.log("\n测试流式聊天助手...");
    const chatAssistants = await client.chatAssistants.list();
    
    if (chatAssistants.length > 0) {
      const chatAssistant = chatAssistants[0];
      console.log(`使用聊天助手: ${chatAssistant.name} (${chatAssistant.id})`);
      
      // 创建会话
      const session = await client.chatAssistants.createSession(chatAssistant.id, {
        name: `流式测试会话 ${new Date().toISOString()}`
      });
      console.log(`创建会话成功: ${session.id}`);
      
      // 流式对话
      let assistantResponse = "";
      const assistantStreamStartTime = Date.now();
      
      await client.chatAssistants.converse(
        chatAssistant.id,
        {
          question: "漳州消防",
          session_id: session.id,
          stream: true
        },
        (data) => {
          if (data.data && typeof data.data !== 'boolean' && data.data.answer) {
            // 由于流式返回可能包含完整响应，我们只取新增部分
            const newContent = data.data.answer.substring(assistantResponse.length);
            if (newContent) {
              assistantResponse = data.data.answer;
              process.stdout.write(newContent);
            }
          }
        }
      );
      
      const assistantStreamDuration = ((Date.now() - assistantStreamStartTime) / 1000).toFixed(2);
      console.log(`\n\n流式聊天助手测试完成，耗时 ${assistantStreamDuration} 秒`);
      console.log(`总共接收到 ${assistantResponse.length} 个字符`);
      
      // 清理会话
      await client.chatAssistants.deleteSessions(chatAssistant.id, [session.id]);
      console.log("测试会话已删除");
    } else {
      console.log("未找到聊天助手，跳过流式聊天助手测试");
    }
    
    // 测试流式代理
    console.log("\n测试流式代理...");
    const agents = await client.agents.list();
    
    if (agents.length > 0) {
      const agent = agents[0];
      console.log(`使用代理: ${agent.title} (${agent.id})`);
      
      // 创建会话
      const session = await client.agents.createSession(agent.id);
      console.log(`创建会话成功: ${session.id}`);
      
      // 流式对话
      let agentResponse = "";
      const agentStreamStartTime = Date.now();
      
      await client.agents.converse(
        agent.id,
        {
          question: "请详细介绍你能提供的主要服务和功能",
          session_id: session.id,
          stream: true
        },
        (data) => {
          if (data.data && typeof data.data !== 'boolean' && data.data.answer) {
            // 由于流式返回可能包含完整响应，我们只取新增部分
            const newContent = data.data.answer.substring(agentResponse.length);
            if (newContent) {
              agentResponse = data.data.answer;
              process.stdout.write(newContent);
            }
          }
        }
      );
      
      const agentStreamDuration = ((Date.now() - agentStreamStartTime) / 1000).toFixed(2);
      console.log(`\n\n流式代理测试完成，耗时 ${agentStreamDuration} 秒`);
      console.log(`总共接收到 ${agentResponse.length} 个字符`);
      
      // 清理会话
      await client.agents.deleteSessions(agent.id, [session.id]);
      console.log("测试会话已删除");
    } else {
      console.log("未找到代理，跳过流式代理测试");
    }
    
  } catch (err) {
    console.error("流式响应测试出错:", err);
  }
}

// 聊天助手测试
async function testChatAssistants() {
  printSeparator("测试聊天助手功能");
  
  try {
    // 获取聊天助手列表
    console.log("获取聊天助手列表...");
    const chatAssistants = await client.chatAssistants.list();
    console.log(`共找到 ${chatAssistants.length} 个聊天助手`);
    
    if (chatAssistants.length > 0) {
      const chatAssistant = chatAssistants[0];
      console.log(`聊天助手信息: ${chatAssistant.name} (${chatAssistant.id})`);
      
      // 获取会话列表
      console.log("\n获取会话列表...");
      const sessions = await client.chatAssistants.listSessions(chatAssistant.id);
      console.log(`共找到 ${sessions.length} 个会话`);
      
      // 创建新会话
      console.log("\n创建新会话...");
      const session = await client.chatAssistants.createSession(chatAssistant.id, {
        name: `测试会话 ${new Date().toISOString()}`
      });
      console.log(`会话创建成功: ${session.name} (${session.id})`);
      
      // 发送消息
      console.log("\n发送测试消息...");
      const response = await client.chatAssistants.converse(
        chatAssistant.id,
        {
          question: "你能简单介绍一下你是什么助手吗？",
          session_id: session.id,
          stream: false
        }
      );
      
      console.log("助手回复:");
      console.log(response.answer);
      
      // 删除会话
      console.log("\n删除测试会话...");
      await client.chatAssistants.deleteSessions(chatAssistant.id, [session.id]);
      console.log("会话删除成功");
    } else {
      console.log("未找到聊天助手，跳过详细测试");
    }
  } catch (err) {
    console.error("聊天助手测试出错:", err);
  }
}

// 代理测试
async function testAgents() {
  printSeparator("测试代理功能");
  
  try {
    // 获取代理列表
    console.log("获取代理列表...");
    const agents = await client.agents.list();
    console.log(`共找到 ${agents.length} 个代理`);
    
    if (agents.length > 0) {
      const agent = agents[0];
      console.log(`代理信息: ${agent.title} (${agent.id})`);
      
      // 获取会话列表
      console.log("\n获取会话列表...");
      const sessions = await client.agents.listSessions(agent.id);
      console.log(`共找到 ${sessions.length} 个会话`);
      
      // 创建新会话
      console.log("\n创建新会话...");
      const session = await client.agents.createSession(agent.id);
      console.log(`会话创建成功: ${session.id}`);
      
      // 发送消息
      console.log("\n发送测试消息...");
      const response = await client.agents.converse(
        agent.id,
        {
          question: "你好，你是什么代理？",
          session_id: session.id,
          stream: false
        }
      );
      
      console.log("代理回复:");
      console.log(response.answer);
      
      // 删除会话
      console.log("\n删除测试会话...");
      await client.agents.deleteSessions(agent.id, [session.id]);
      console.log("会话删除成功");
    } else {
      console.log("未找到代理，跳过详细测试");
    }
  } catch (err) {
    console.error("代理测试出错:", err);
  }
}

// 聊天完成测试
async function testChatCompletion() {
  printSeparator("测试聊天完成功能");
  
  try {
    console.log("发送聊天消息...");
    const completion = await client.chat.createCompletion("test-chat", {
      model: "DeepSeek-V3", // 请根据实际可用模型调整
      messages: [
        { role: "system", content: "你是一个有用的AI助手" },
        { role: "user", content: "简单介绍一下RagFlow是什么？" }
      ],
      stream: false
    });
    
    console.log("AI回复:");
    console.log("completion: ", completion);
    
    if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
      console.log(completion.choices[0].message.content);
    } else {
      console.log("未收到有效回复");
    }
  } catch (err) {
    console.error("聊天完成测试出错:", err);
  }
}

// 执行所有测试
async function runAllTests() {
  try {
    console.log("开始RagFlow真实环境测试...");
    console.log(`测试服务器: ${config.baseUrl}`);
    
    // 根据配置执行测试
    if (config.runTests.datasets) {
      await testDatasets();
    }
    
    if (config.runTests.documentUpload) {
      await testDocumentUpload();
    }
    
    if (config.runTests.retrieval) {
      await testRetrieval();
    }
    
    if (config.runTests.streamResponse) {
      await testStreamResponse();
    }
    
    if (config.runTests.chatAssistants) {
      await testChatAssistants();
    }
    
    if (config.runTests.agents) {
      await testAgents();
    }
    
    if (config.runTests.chatCompletion) {
      await testChatCompletion();
    }
    
    console.log("\n所有测试完成！");
  } catch (err) {
    console.error("测试过程中出错:", err);
  }
}

// 运行测试
runAllTests();


