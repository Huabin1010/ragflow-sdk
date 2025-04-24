"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getClient, mockDatasets, mockRetrievalResults } from '../config';
import StatusCard from '../components/StatusCard';

export default function RetrievalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetId = searchParams.get('datasetId');
  
  const [dataset, setDataset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>(datasetId ? [datasetId] : []);
  
  const [question, setQuestion] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  
  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const client = getClient();
        
        // 获取所有数据集列表
        const datasetsResult = await client.datasets.list();
        setDatasets(datasetsResult);
        
        // 如果有指定数据集ID，获取该数据集详情
        if (datasetId) {
          const datasetInfo = await client.datasets.get(datasetId);
          setDataset(datasetInfo);
        }
        
        setError(null);
      } catch (err) {
        console.error("获取数据失败:", err);
        setError("无法连接到服务器，使用模拟数据");
        // 使用模拟数据
        setDatasets(mockDatasets);
        if (datasetId) {
          const mockDataset = mockDatasets.find(d => d.id === datasetId);
          setDataset(mockDataset || mockDatasets[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [datasetId]);

  // 处理数据集选择变化
  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      setSelectedDatasetIds([value]);
      
      // 更新URL参数但不刷新页面
      const url = new URL(window.location.href);
      url.searchParams.set('datasetId', value);
      window.history.pushState({}, '', url.toString());
      
      // 获取数据集详情
      const selectedDataset = datasets.find(d => d.id === value);
      if (selectedDataset) {
        setDataset(selectedDataset);
      }
    }
  };

  // 执行检索
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || selectedDatasetIds.length === 0) {
      return;
    }
    
    setIsSearching(true);
    setSearchResults(null);
    
    try {
      const client = getClient();
      const results = await client.retrieval.retrieve({
        question,
        dataset_ids: selectedDatasetIds,
        similarity_threshold: similarityThreshold,
        highlight: true,
        top_k: 5
      });
      
      setSearchResults(results);
    } catch (err) {
      console.error("检索失败:", err);
      
      // 使用模拟数据
      if (question.includes('产品') || question.includes('功能')) {
        setSearchResults(mockRetrievalResults['产品功能']);
      } else {
        // 创建空结果
        setSearchResults({ total: 0, chunks: [] });
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/datasets" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2">
            ← 返回数据集
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">知识检索</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          基于语义相似度，从您的知识库中检索相关信息
        </p>
      </div>

      {error && (
        <StatusCard 
          type="info" 
          title="使用模拟数据" 
          message="当前使用模拟数据进行展示，某些操作可能无法执行" 
        />
      )}

      {/* 检索表单 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label htmlFor="dataset" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              选择数据集
            </label>
            <select
              id="dataset"
              value={selectedDatasetIds[0] || ''}
              onChange={handleDatasetChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">-- 选择数据集 --</option>
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.document_count}文档, {ds.chunk_count}文本块)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              检索问题
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="输入您的问题或关键词，例如：产品A有哪些主要功能？"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
              required
            />
          </div>
          
          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              相似度阈值: {similarityThreshold}
            </label>
            <input
              id="threshold"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 (更多结果)</span>
              <span>1 (更精确结果)</span>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSearching || !question.trim() || selectedDatasetIds.length === 0}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isSearching || !question.trim() || selectedDatasetIds.length === 0
                  ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
              }`}
            >
              {isSearching ? '检索中...' : '开始检索'}
            </button>
          </div>
        </form>
      </div>

      {/* 检索结果 */}
      {isSearching ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">检索中，请稍候...</p>
        </div>
      ) : searchResults ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">检索结果</h2>
            <span className="text-gray-500 dark:text-gray-400">
              共找到 {searchResults.total} 条匹配
            </span>
          </div>
          
          {searchResults.total === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">未找到相关结果，请尝试调整检索问题或降低相似度阈值</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.chunks.map((chunk: any, index: number) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      相似度: {chunk.similarity.toFixed(4)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      来源: {chunk.metadata?.source || '未知'} 
                      {chunk.metadata?.page ? ` (第${chunk.metadata.page}页)` : ''}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* 使用提示 */}
      {!searchResults && !isSearching && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">检索提示</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>使用具体、明确的问题可以获得更精确的结果</li>
            <li>调整相似度阈值可以控制返回结果的数量和质量</li>
            <li>尝试使用不同的措辞或关键词组合进行多次检索</li>
            <li>添加上下文信息可以帮助系统更好地理解您的意图</li>
          </ul>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-800 dark:text-blue-300">
            <h3 className="font-medium mb-2">示例检索问题:</h3>
            <ul className="space-y-1 pl-5 list-disc">
              <li>产品A的主要功能有哪些？</li>
              <li>技术规格和系统要求是什么？</li>
              <li>产品安装步骤</li>
              <li>如何解决网络连接问题</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 