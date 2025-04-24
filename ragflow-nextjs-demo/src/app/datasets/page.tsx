"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClient, mockDatasets } from '../config';
import StatusCard from '../components/StatusCard';

// 格式化日期函数
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [embeddingModel, setEmbeddingModel] = useState('BAAI/bge-m3');

  // 加载数据集列表
  useEffect(() => {
    const fetchDatasets = async () => {
      setIsLoading(true);
      try {
        const client = getClient();
        const result = await client.datasets.list();
        setDatasets(result);
        setError(null);
      } catch (err) {
        console.error("获取数据集失败:", err);
        setError("无法连接到服务器，使用模拟数据");
        setDatasets(mockDatasets);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  // 创建新数据集
  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDatasetName.trim()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      const client = getClient();
      const result = await client.datasets.create({
        name: newDatasetName,
        embedding_model: embeddingModel,
        chunk_method: 'naive'
      });
      
      // 成功创建后，添加到列表中
      setDatasets(prev => [result, ...prev]);
      setNewDatasetName('');
      setIsCreating(false);
    } catch (err) {
      console.error("创建数据集失败:", err);
      // 模拟创建效果
      const mockNewDataset = {
        id: `mock-${Date.now()}`,
        name: newDatasetName,
        embedding_model: embeddingModel,
        chunk_count: 0,
        document_count: 0,
        description: '新创建的数据集',
        created_at: new Date().toISOString()
      };
      setDatasets(prev => [mockNewDataset, ...prev]);
      setNewDatasetName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">数据集管理</h1>
        <p className="text-gray-600 dark:text-gray-300">
          创建和管理知识库数据集，组织您的文档资源
        </p>
      </div>

      {error && (
        <StatusCard 
          type="info" 
          title="使用模拟数据" 
          message="当前使用模拟数据进行展示，某些操作可能无法执行" 
        />
      )}

      {/* 创建数据集表单 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">创建新数据集</h2>
        <form onSubmit={handleCreateDataset} className="space-y-4">
          <div>
            <label htmlFor="datasetName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              数据集名称
            </label>
            <input
              type="text"
              id="datasetName"
              value={newDatasetName}
              onChange={(e) => setNewDatasetName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="输入数据集名称"
              required
            />
          </div>
          
          <div>
            <label htmlFor="embeddingModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              嵌入模型
            </label>
            <select
              id="embeddingModel"
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="BAAI/bge-m3">BAAI/bge-m3</option>
              <option value="BAAI/bge-large-zh-v1.5">BAAI/bge-large-zh-v1.5</option>
              <option value="text-embedding-ada-002">text-embedding-ada-002</option>
            </select>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isCreating || !newDatasetName.trim()}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isCreating || !newDatasetName.trim() 
                  ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
              }`}
            >
              {isCreating ? '创建中...' : '创建数据集'}
            </button>
          </div>
        </form>
      </div>

      {/* 数据集列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">数据集列表</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400">加载数据集...</p>
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无数据集，请创建一个新的数据集开始使用</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    文档数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    文本块数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    嵌入模型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {datasets.map((dataset) => (
                  <tr key={dataset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{dataset.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{dataset.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {dataset.document_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {dataset.chunk_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {dataset.embedding_model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/documents?datasetId=${dataset.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                      >
                        文档管理
                      </Link>
                      <Link 
                        href={`/retrieval?datasetId=${dataset.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        知识检索
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 