import { RagFlowClient } from '../src';

// 配置客户端
const client = new RagFlowClient({
  baseUrl: 'http://localhost:8000', // 替换为您的RagFlow服务地址
  apiKey: 'your-api-key' // 替换为您的API密钥
});

// 创建一个示例函数，演示SDK的用法
async function example() {
  try {
    // 创建数据集
    console.log('创建数据集...');
    const dataset = await client.datasets.create({
      name: 'example_dataset',
      description: '示例数据集',
      embedding_model: 'BAAI/bge-large-zh-v1.5',
      chunk_method: 'naive'
    });
    console.log('数据集创建成功:', dataset);

    // 上传文档
    console.log('\n上传文档...');
    // 假设在当前目录有一个sample.txt文件
    const documents = await client.documents.upload(dataset.id, './sample.txt');
    console.log('文档上传成功:', documents);

    // 解析文档
    console.log('\n开始解析文档...');
    await client.documents.parse(dataset.id, [documents[0].id]);
    console.log('文档解析已开始，请等待解析完成');

    // 等待5秒，假设文档已解析完成
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 获取文档列表
    console.log('\n获取文档列表...');
    const documentList = await client.documents.list(dataset.id);
    console.log('文档列表:', documentList);

    // 检索内容
    console.log('\n检索内容...');
    const retrievalResults = await client.retrieval.retrieve({
      question: '示例问题?',
      dataset_ids: [dataset.id],
      highlight: true
    });
    console.log('检索结果:', retrievalResults);

    // 聊天完成
    console.log('\n聊天完成...');
    const chatId = 'example-chat-id'; // 实际应用中应该是一个有效的聊天ID
    
    // 非流式响应
    const completion = await client.chat.createCompletion(chatId, {
      model: 'model',
      messages: [
        { role: 'user', content: '你好，这是一个测试问题' }
      ],
      stream: false
    });
    console.log('聊天完成结果:', completion);

    // 流式响应示例
    console.log('\n流式聊天完成...');
    await client.chat.createCompletion(
      chatId,
      {
        model: 'model',
        messages: [
          { role: 'user', content: '你好，这是一个测试流式响应' }
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
    console.log('\n流式响应结束');

    // 清理示例数据
    console.log('\n清理示例数据...');
    await client.documents.delete(dataset.id, [documents[0].id]);
    await client.datasets.delete([dataset.id]);
    console.log('示例数据已清理');

  } catch (error) {
    console.error('示例运行出错:', error);
  }
}

// 运行示例
example(); 