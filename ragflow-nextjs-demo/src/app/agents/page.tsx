"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getClient, mockAgents, mockAgentSessions, mockAgentConversations } from '../config';
import StatusCard from '../components/StatusCard';

interface AgentConfig {
  id: string;
  title: string;
  description: string | undefined;
  model?: string;
  created_at?: string;
  tools?: string[];
}

interface AgentSession {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface AgentMessage {
  role: "user" | "agent" | string;
  content: string;
  timestamp?: string;
  thinking?: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AgentSession | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // 初始化数据
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        const client = getClient();
        
        // 获取智能代理列表
        const result = await client.agents.list();
        setAgents(result as unknown as AgentConfig[]);
        
        if (result.length > 0) {
          setSelectedAgent(result[0] as unknown as AgentConfig);
          await fetchSessions(result[0].id);
        }
        
        setError(null);
      } catch (err) {
        console.error("获取智能代理失败:", err);
        setError("无法连接到服务器，使用模拟数据");
        
        // 使用模拟数据
        setAgents(mockAgents);
        if (mockAgents.length > 0) {
          setSelectedAgent(mockAgents[0]);
          
          // 获取模拟会话列表
          const mockSessionList = mockAgentSessions[mockAgents[0].id as keyof typeof mockAgentSessions] || [];
          setSessions(mockSessionList);
          
          if (mockSessionList.length > 0) {
            setSelectedSession(mockSessionList[0]);
            
            // 获取模拟对话内容
            const mockConversation = mockAgentConversations[mockSessionList[0].id as keyof typeof mockAgentConversations] || [];
            setMessages(mockConversation as AgentMessage[]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // 获取会话列表
  const fetchSessions = async (agentId: string) => {
    setIsLoading(true);
    try {
      const client = getClient();
      const result = await client.agents.listSessions(agentId);
      setSessions(result as unknown as AgentSession[]);
      
      // 默认选择第一个会话
      if (result.length > 0) {
        setSelectedSession(result[0] as unknown as AgentSession);
        await fetchMessages(agentId, result[0].id);
      } else {
        setMessages([]);
        setSelectedSession(null);
      }
    } catch (err) {
      console.error("获取会话列表失败:", err);
      
      // 使用模拟数据
      const mockSessionList = mockAgentSessions[agentId as keyof typeof mockAgentSessions] || [];
      setSessions(mockSessionList);
      
      if (mockSessionList.length > 0) {
        setSelectedSession(mockSessionList[0]);
        
        // 获取模拟对话内容
        const mockConversation = mockAgentConversations[mockSessionList[0].id as keyof typeof mockAgentConversations] || [];
        setMessages(mockConversation as AgentMessage[]);
      } else {
        setMessages([]);
        setSelectedSession(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 获取对话消息
  const fetchMessages = async (agentId: string, sessionId: string) => {
    try {
      const client = getClient();
      // 由于SDK可能不支持getMessages方法，使用try-catch处理
      try {
        const result = await client.agents.getMessages(agentId, sessionId);
        setMessages(result as unknown as AgentMessage[]);
      } catch {
        // 如果SDK不支持getMessages方法，使用模拟数据
        const mockConversation = mockAgentConversations[sessionId as keyof typeof mockAgentConversations] || [];
        setMessages(mockConversation as AgentMessage[]);
      }
    } catch (err) {
      console.error("获取对话消息失败:", err);
      
      // 使用模拟数据
      const mockConversation = mockAgentConversations[sessionId as keyof typeof mockAgentConversations] || [];
      setMessages(mockConversation as AgentMessage[]);
    }
  };

  // 选择代理
  const handleSelectAgent = async (agent: AgentConfig) => {
    setSelectedAgent(agent);
    setSelectedSession(null);
    setMessages([]);
    await fetchSessions(agent.id);
  };

  // 选择会话
  const handleSelectSession = async (session: AgentSession) => {
    if (!selectedAgent) return;
    setSelectedSession(session);
    await fetchMessages(selectedAgent.id, session.id);
  };

  // 创建新会话
  const handleNewSession = async () => {
    if (!selectedAgent) return;
    
    try {
      const client = getClient();
      const sessionName = `新会话 ${new Date().toLocaleString()}`;
      const newSession = await client.agents.createSession(selectedAgent.id, { name: sessionName });
      
      // 更新会话列表
      setSessions(prev => [newSession as unknown as AgentSession, ...prev]);
      
      // 选择新会话
      setSelectedSession(newSession as unknown as AgentSession);
      setMessages([]);
    } catch (err) {
      console.error("创建会话失败:", err);
      
      // 模拟创建会话
      const newMockSession = {
        id: `session-${Date.now()}`,
        name: `新会话 ${new Date().toLocaleString()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSessions(prev => [newMockSession, ...prev]);
      setSelectedSession(newMockSession);
      setMessages([]);
    }
  };

  // 发送消息
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgent || !selectedSession || !input.trim() || isSending) return;
    
    const userMessage: AgentMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };
    
    // 更新消息列表
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    
    try {
      const client = getClient();
      try {
        // 尝试使用SDK的converse方法
        const response = await client.agents.converse(
          selectedAgent.id,
          selectedSession.id,
          {
            question: input
          }
        );
        
        if (response) {
          const agentMessage: AgentMessage = {
            role: "agent",
            content: response.answer || "我没有找到相关答案",
            timestamp: new Date().toISOString(),
            // SDK返回的response可能没有thinking字段
            thinking: response.thinking || undefined
          };
          
          setMessages(prev => [...prev, agentMessage]);
        }
      } catch (err) {
        console.error("SDK converse方法错误:", err);
        // 降级到模拟响应
        setTimeout(() => {
          const mockResponse: AgentMessage = {
            role: "agent",
            content: "我理解您的问题。基于我的分析，我推荐您考虑产品A，它更符合您描述的需求。需要了解更多产品细节吗？",
            timestamp: new Date().toISOString(),
            thinking: "用户似乎在寻找产品建议。基于上下文，产品A拥有更全面的功能，可能更适合用户的需求。应提供专业建议并询问是否需要更多信息。"
          };
          
          setMessages(prev => [...prev, mockResponse]);
        }, 1500);
      }
    } catch (err) {
      console.error("发送消息失败:", err);
      
      // 模拟代理回复
      setTimeout(() => {
        const mockResponse: AgentMessage = {
          role: "agent",
          content: "我理解您的问题。基于我的分析，我推荐您考虑产品A，它更符合您描述的需求。需要了解更多产品细节吗？",
          timestamp: new Date().toISOString(),
          thinking: "用户似乎在寻找产品建议。基于上下文，产品A拥有更全面的功能，可能更适合用户的需求。应提供专业建议并询问是否需要更多信息。"
        };
        
        setMessages(prev => [...prev, mockResponse]);
      }, 1500);
    } finally {
      setIsSending(false);
    }
  };

  // 滚动到最新消息
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 格式化时间
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">智能代理</h1>
        <p className="text-gray-600 dark:text-gray-300">
          基于您的知识库部署智能代理，执行复杂任务
        </p>
      </div>

      {error && (
        <StatusCard 
          type="info" 
          title="使用模拟数据" 
          message="当前使用模拟数据进行展示，某些操作可能无法执行" 
        />
      )}

      {agents.length === 0 && !isLoading ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">暂无可用的智能代理</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">请先在RagFlow平台上创建智能代理</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 左侧边栏 */}
          <div className="md:col-span-1">
            {/* 代理列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">可用代理</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {agents.map(agent => (
                    <div 
                      key={agent.id} 
                      className={`p-3 rounded-lg cursor-pointer ${
                        selectedAgent?.id === agent.id 
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 border' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                      onClick={() => handleSelectAgent(agent)}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white">{agent.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{agent.description}</p>
                      {agent.tools && agent.tools.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {agent.tools.map((tool, index) => (
                            <span 
                              key={index} 
                              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 会话列表 */}
            {selectedAgent && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">会话列表</h2>
                  <button 
                    onClick={handleNewSession}
                    className="text-sm bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    新会话
                  </button>
                </div>
                <div className="p-4">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>暂无会话</p>
                      <p className="text-sm mt-1">点击"新会话"开始对话</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map(session => (
                        <div 
                          key={session.id} 
                          className={`p-2 rounded cursor-pointer ${
                            selectedSession?.id === session.id 
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                          onClick={() => handleSelectSession(session)}
                        >
                          <div className="font-medium">{session.name}</div>
                          {session.updated_at && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(session.updated_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧聊天区域 */}
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col h-[70vh]">
            {/* 聊天头部 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                {selectedAgent ? (
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {selectedAgent.title}
                    </h2>
                    {selectedSession && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        会话: {selectedSession.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">请选择一个智能代理</div>
                )}
              </div>
              {messages.some(m => m.thinking) && (
                <div>
                  <label className="text-sm flex items-center cursor-pointer text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={showThinking}
                      onChange={() => setShowThinking(!showThinking)}
                      className="mr-2"
                    />
                    显示思考过程
                  </label>
                </div>
              )}
            </div>

            {/* 聊天内容 */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : !selectedAgent || !selectedSession ? (
                <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                  {!selectedAgent ? "请选择一个智能代理" : "请选择或创建一个会话"}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">开始与智能代理对话</div>
                  <div className="max-w-md text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">提示:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>清晰描述您的问题或任务</li>
                      <li>提供必要的上下文信息</li>
                      <li>如果代理的回答不满意，可以要求澄清或提供更多细节</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`rounded-lg px-4 py-3 max-w-[80%] ${
                          message.role === 'user' 
                            ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="text-xs text-gray-100 dark:text-gray-300 mb-1">
                          {message.role === 'user' ? '您' : selectedAgent.title} • {formatTime(message.timestamp)}
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {showThinking && message.thinking && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-100 dark:text-gray-300 mb-1">思考过程:</div>
                            <div className="text-sm italic text-gray-100 dark:text-gray-300 whitespace-pre-wrap">{message.thinking}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  placeholder={
                    !selectedAgent 
                      ? "请先选择智能代理" 
                      : !selectedSession 
                      ? "请先选择或创建会话" 
                      : "输入您的问题或任务..."
                  }
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!selectedAgent || !selectedSession || isSending}
                />
                <button
                  type="submit"
                  disabled={!selectedAgent || !selectedSession || !input.trim() || isSending}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                  {isSending ? "发送中..." : "发送"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 