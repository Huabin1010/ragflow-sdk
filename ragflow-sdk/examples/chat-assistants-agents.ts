import { RagFlowClient } from '../src';

// 配置客户端
const client = new RagFlowClient({
  baseUrl: 'http://localhost:8000', // 替换为您的RagFlow服务地址
  apiKey: 'your-api-key' // 替换为您的API密钥
});

// 示例函数：使用聊天助手
async function chatAssistantExample() {
  try {
    // 获取现有数据集列表
    console.log('获取数据集列表...');
    const datasets = await client.datasets.list();
    if (!datasets || datasets.length === 0) {
      console.log('未找到数据集，请先创建数据集');
      return;
    }
    
    // 创建聊天助手
    console.log('创建聊天助手...');
    const chatAssistant = await client.chatAssistants.create({
      name: '测试助手',
      dataset_ids: [datasets[0].id], // 使用第一个数据集
      llm: {
        model_name: 'qwen-plus@Tongyi-Qianwen', // 根据实际可用模型调整
        temperature: 0.1,
        top_p: 0.3,
        presence_penalty: 0.4,
        frequency_penalty: 0.7,
        max_tokens: 512
      },
      prompt: {
        similarity_threshold: 0.2,
        keywords_similarity_weight: 0.3,
        top_n: 6,
        variables: [{ key: 'knowledge', optional: false }],
        empty_response: '抱歉！在知识库中没有找到相关内容！',
        opener: '您好！我是您的助手，有什么可以帮您的？',
        prompt: '你是一个智能助手。请总结知识库中的内容来回答问题。请列出知识库中的数据并详细回答。当所有知识库内容与问题无关时，你的回答必须包含"您查找的答案在知识库中未找到！"这个句子。需要考虑聊天历史回答。\n '
      }
    });
    console.log('聊天助手创建成功:', chatAssistant);

    // 创建会话
    console.log('\n创建聊天会话...');
    const session = await client.chatAssistants.createSession(chatAssistant.id, {
      name: '测试会话'
    });
    console.log('会话创建成功:', session);

    // 与聊天助手对话（非流式）
    console.log('\n与聊天助手对话...');
    const converseResult = await client.chatAssistants.converse(
      chatAssistant.id,
      {
        question: '介绍一下RagFlow的功能',
        session_id: session.id,
        stream: false
      }
    );
    console.log('对话响应:', converseResult);

    // 与聊天助手对话（流式）
    console.log('\n流式对话...');
    await client.chatAssistants.converse(
      chatAssistant.id,
      {
        question: '如何使用RagFlow创建数据集？',
        session_id: session.id,
        stream: true
      },
      (data) => {
        if (data.data && typeof data.data !== 'boolean' && data.data.answer) {
          process.stdout.write(data.data.answer.slice(-10)); // 简化输出，仅显示最新部分
        }
      }
    );
    console.log('\n流式对话结束');

    // 获取会话列表
    console.log('\n获取会话列表...');
    const sessions = await client.chatAssistants.listSessions(chatAssistant.id);
    console.log('会话列表:', sessions);

    // 清理
    console.log('\n清理资源...');
    await client.chatAssistants.deleteSessions(chatAssistant.id, [session.id]);
    await client.chatAssistants.delete([chatAssistant.id]);
    console.log('资源清理完成');
  } catch (error) {
    console.error('聊天助手示例运行出错:', error);
  }
}

// 示例函数：使用代理
async function agentExample() {
  try {
    console.log('获取代理列表...');
    const agents = await client.agents.list();
    
    if (!agents || agents.length === 0) {
      console.log('未找到代理，请先在RagFlow界面创建代理');
      return;
    }
    
    const agent = agents[0]; // 使用第一个代理
    console.log(`使用代理: ${agent.title} (${agent.id})`);
    
    // 创建代理会话
    console.log('\n创建代理会话...');
    const session = await client.agents.createSession(agent.id);
    console.log('会话创建成功:', session);
    
    // 与代理对话
    console.log('\n与代理对话...');
    const converseResult = await client.agents.converse(
      agent.id,
      {
        question: '你好，请介绍一下你能做什么',
        session_id: session.id,
        stream: false
      }
    );
    console.log('对话响应:', converseResult);
    
    // 流式对话
    console.log('\n流式对话...');
    await client.agents.converse(
      agent.id,
      {
        question: '请给我提供一些使用建议',
        session_id: session.id,
        stream: true
      },
      (data) => {
        if (data.data && typeof data.data !== 'boolean' && data.data.answer) {
          process.stdout.write(data.data.answer.slice(-10)); // 简化输出，仅显示最新部分
        }
      }
    );
    console.log('\n流式对话结束');
    
    // 获取会话列表
    console.log('\n获取代理会话列表...');
    const sessions = await client.agents.listSessions(agent.id);
    console.log('会话列表:', sessions);
    
    // 清理
    console.log('\n清理资源...');
    await client.agents.deleteSessions(agent.id, [session.id]);
    console.log('资源清理完成');
  } catch (error) {
    console.error('代理示例运行出错:', error);
  }
}

// 运行示例
async function runExamples() {
  console.log('=== 开始聊天助手示例 ===');
  await chatAssistantExample();
  
  console.log('\n\n=== 开始代理示例 ===');
  await agentExample();
}

runExamples(); 