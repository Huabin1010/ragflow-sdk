"use client";

import { RagFlowClient } from "@qzsy/ragflow-sdk";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface ChatAssistant {
  id: string;
  name: string;
  description?: string;
  model?: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  name: string;
  created_at?: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function ChatPage() {
  const [client, setClient] = useState<RagFlowClient | null>(null);
  const [assistants, setAssistants] = useState<ChatAssistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<ChatAssistant | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化客户端
  useEffect(() => {
    const initClient = async () => {
      try {
        const ragFlowClient = new RagFlowClient({
          baseUrl: "http://192.168.1.75:3000",
          apiKey: "ragflow-YzNWUyNTM0MTU1MjExZjA4NTNjNzJmYz",
        });
        setClient(ragFlowClient);
        
        // 获取助手列表
        await fetchAssistants(ragFlowClient);
      } catch (err) {
        setError("无法初始化 RagFlow 客户端");
        setLoading(false);
      }
    };

    initClient();
  }, []);

  // 获取助手列表
  const fetchAssistants = async (c: RagFlowClient) => {
    setLoading(true);
    try {
      const response = await c.chatAssistants.list();
      setAssistants(response);
      
      // 默认选择第一个助手
      if (response.length > 0) {
        setSelectedAssistant(response[0]);
        await fetchSessions(c, response[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError("获取聊天助手列表失败");
      console.error("获取聊天助手列表错误:", err);
      setLoading(false);
    }
  };

  // 获取会话列表
  const fetchSessions = async (c: RagFlowClient, assistantId: string) => {
    setLoading(true);
    try {
      const response = await c.chatAssistants.listSessions(assistantId);
      setSessions(response);
      
      // 清空选中的会话和消息
      setSelectedSession(null);
      setMessages([]);
      
      // 默认选择第一个会话
      if (response.length > 0) {
        await selectSession(c, assistantId, response[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError("获取会话列表失败");
      console.error("获取会话列表错误:", err);
      setLoading(false);
    }
  };

  // 选择助手
  const handleSelectAssistant = async (assistant: ChatAssistant) => {
    if (!client) return;
    
    setSelectedAssistant(assistant);
    setSelectedSession(null);
    setMessages([]);
    await fetchSessions(client, assistant.id);
  };

  // 选择会话
  const selectSession = async (c: RagFlowClient, assistantId: string, session: ChatSession) => {
    setSelectedSession(session);
    
    // 添加历史记录
    setMessages([
      {
        role: "system",
        content: "已加载聊天历史记录",
        timestamp: new Date().toISOString()
      }
    ]);
    
    setLoading(false);
  };

  // 创建新会话
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !selectedAssistant) return;
    
    setLoading(true);
    try {
      const newSession = await client.chatAssistants.createSession(selectedAssistant.id, {
        name: newSessionName || `会话 ${new Date().toLocaleString()}`
      });
      
      // 重新获取会话列表
      await fetchSessions(client, selectedAssistant.id);
      
      // 选择新创建的会话
      await selectSession(client, selectedAssistant.id, newSession);
      
      // 重置表单
      setNewSessionName("");
      setShowNewSessionForm(false);
    } catch (err) {
      setError("创建会话失败");
      console.error("创建会话错误:", err);
      setLoading(false);
    }
  };

  // 发送消息
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !selectedAssistant || !selectedSession || !input.trim() || sending) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };
    
    // 更新UI显示用户消息
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSending(true);
    
    try {
      const response = await client.chatAssistants.converse(
        selectedAssistant.id,
        {
          question: userMessage.content,
          session_id: selectedSession.id,
          stream: false
        }
      );
      
      if (response && response.answer) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.answer,
          timestamp: new Date().toISOString()
        };
        
        // 更新UI显示助手回复
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("助手未返回有效回复");
      }
    } catch (err) {
      setError("发送消息失败");
      console.error("发送消息错误:", err);
    } finally {
      setSending(false);
    }
  };

  // 删除会话
  const handleDeleteSession = async (sessionId: string) => {
    if (!client || !selectedAssistant) return;
    if (!confirm("确认删除此会话？此操作不可恢复。")) return;
    
    setLoading(true);
    try {
      await client.chatAssistants.deleteSessions(selectedAssistant.id, [sessionId]);
      
      // 重新获取会话列表
      await fetchSessions(client, selectedAssistant.id);
    } catch (err) {
      setError("删除会话失败");
      console.error("删除会话错误:", err);
      setLoading(false);
    }
  };

  // 自动滚动到消息底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 格式化消息时间
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">聊天助手</h1>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {assistants.length === 0 && !loading ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">暂无可用的聊天助手</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">请在RagFlow平台上创建聊天助手后再使用此功能</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* 左侧边栏 - 助手和会话列表 */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            {/* 助手列表 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">聊天助手</h2>
              <div className="space-y-2">
                {assistants.map(assistant => (
                  <button
                    key={assistant.id}
                    className={`w-full text-left p-2 rounded-md ${
                      selectedAssistant?.id === assistant.id
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                    onClick={() => handleSelectAssistant(assistant)}
                  >
                    <div className="font-medium">{assistant.name}</div>
                    {assistant.model && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">模型: {assistant.model}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 会话列表 */}
            {selectedAssistant && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">会话列表</h2>
                  <button
                    onClick={() => setShowNewSessionForm(!showNewSessionForm)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                  >
                    {showNewSessionForm ? "取消" : "新会话"}
                  </button>
                </div>
                
                {/* 创建会话表单 */}
                {showNewSessionForm && (
                  <form onSubmit={handleCreateSession} className="mb-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="会话名称（可选）"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium py-2 px-3 rounded text-sm"
                      >
                        创建
                      </button>
                    </div>
                  </form>
                )}
                
                {sessions.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>暂无会话</p>
                    <p className="text-sm mt-1">点击"新会话"开始对话</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sessions.map(session => (
                      <div 
                        key={session.id}
                        className={`p-2 rounded-md flex justify-between items-center ${
                          selectedSession?.id === session.id
                            ? "bg-blue-100 dark:bg-blue-900/50 text-gray-800 dark:text-gray-200"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        <button
                          className="text-left flex-1 truncate"
                          onClick={() => client && selectSession(client, selectedAssistant.id, session)}
                        >
                          <div className="font-medium">{session.name}</div>
                          {session.created_at && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(session.created_at).toLocaleDateString()}
                            </div>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 ml-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 右侧聊天区域 */}
          <div className="md:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col h-[70vh]">
            {/* 聊天头部 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              {selectedAssistant && selectedSession ? (
                <div>
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{selectedAssistant.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">会话: {selectedSession.name}</p>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  {!selectedAssistant ? "请选择一个聊天助手" : "请选择或创建一个会话"}
                </div>
              )}
            </div>
            
            {/* 聊天消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "system" ? (
                        <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-4 py-2 max-w-[75%] text-sm">
                          {msg.content}
                        </div>
                      ) : (
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[75%] ${
                            msg.role === "user"
                              ? "bg-blue-500 dark:bg-blue-600 text-white"
                              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {msg.role === "user" ? "您" : selectedAssistant?.name} • {formatTime(msg.timestamp)}
                          </div>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* 输入区域 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  placeholder={
                    !selectedAssistant
                      ? "请先选择聊天助手"
                      : !selectedSession
                      ? "请先选择或创建会话"
                      : "输入您的问题..."
                  }
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!selectedAssistant || !selectedSession || sending}
                />
                <button
                  type="submit"
                  disabled={!selectedAssistant || !selectedSession || !input.trim() || sending}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                  {sending ? "发送中..." : "发送"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 