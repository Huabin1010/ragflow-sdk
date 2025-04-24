"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getClient, mockDatasets, mockDocuments } from '../config';
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

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetId = searchParams.get('datasetId');
  
  const [dataset, setDataset] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // 重定向如果没有datasetId
  useEffect(() => {
    if (!datasetId) {
      router.push('/datasets');
    }
  }, [datasetId, router]);

  // 加载数据集信息和文档列表
  useEffect(() => {
    if (!datasetId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const client = getClient();
        
        // 获取数据集信息
        const datasetInfo = await client.datasets.get(datasetId);
        setDataset(datasetInfo);
        
        // 获取文档列表
        const docsResult = await client.documents.list(datasetId);
        setDocuments(docsResult.docs);
        setError(null);
      } catch (err) {
        console.error("获取数据失败:", err);
        setError("无法连接到服务器，使用模拟数据");
        // 使用模拟数据
        const mockDataset = mockDatasets.find(d => d.id === datasetId);
        setDataset(mockDataset || mockDatasets[0]);
        
        // 使用类型断言解决索引签名问题
        const mockDocsForDataset = mockDocuments[datasetId as keyof typeof mockDocuments] 
          || mockDocuments[mockDatasets[0].id as keyof typeof mockDocuments]
          || [];
        
        setDocuments(mockDocsForDataset);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [datasetId]);

  // 文件上传处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 上传文档
  const handleUpload = async () => {
    if (!selectedFile || !datasetId) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const client = getClient();
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 300);

      // 读取文件内容
      const fileContent = await selectedFile.arrayBuffer();
      
      // 创建Blob对象并转换为Buffer
      const buffer = Buffer.from(fileContent);
      
      // 按照API要求的格式包装文件
      const fileObject = {
        content: buffer,
        filename: selectedFile.name
      };
      
      // 上传文件
      const result = await client.documents.upload(datasetId, fileObject);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 添加到文档列表
      if (result && result.length > 0) {
        setDocuments(prev => [...result, ...prev]);
        setSelectedDocIds(result.map(doc => doc.id));
      }
      
      // 重置文件选择
      setSelectedFile(null);
      
      // 模拟上传成功后自动提示解析
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      console.error("上传文档失败:", err);
      
      // 模拟上传效果（出错时）
      const mockDoc = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        size: selectedFile.size,
        chunk_count: 0,
        status: "pending",
        created_at: new Date().toISOString()
      };
      
      setDocuments(prev => [mockDoc, ...prev]);
      setSelectedDocIds([mockDoc.id]);
      setSelectedFile(null);
      setIsUploading(false);
    }
  };

  // 解析文档
  const handleParse = async () => {
    if (selectedDocIds.length === 0 || !datasetId) return;
    
    setIsParsing(true);
    
    try {
      const client = getClient();
      await client.documents.parse(datasetId, selectedDocIds);
      
      // 更新文档状态
      setDocuments(prev => 
        prev.map(doc => 
          selectedDocIds.includes(doc.id) 
            ? { ...doc, status: "processing" } 
            : doc
        )
      );
      
      // 清除选中的文档
      setSelectedDocIds([]);
    } catch (err) {
      console.error("解析文档失败:", err);
      
      // 模拟解析状态变化
      setDocuments(prev => 
        prev.map(doc => 
          selectedDocIds.includes(doc.id) 
            ? { ...doc, status: "processing" } 
            : doc
        )
      );
      setSelectedDocIds([]);
    } finally {
      setIsParsing(false);
    }
  };

  // 获取状态标签样式
  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  if (!datasetId) {
    return null; // 重定向处理中
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/datasets" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2">
            ← 返回数据集
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{dataset?.name || '文档管理'}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          上传并管理此数据集中的文档
        </p>
      </div>

      {error && (
        <StatusCard 
          type="info" 
          title="使用模拟数据" 
          message="当前使用模拟数据进行展示，某些操作可能无法执行" 
        />
      )}

      {/* 文件上传区域 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">上传文档</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800/50"
            disabled={isUploading}
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              !selectedFile || isUploading
                ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
            }`}
          >
            {isUploading ? '上传中...' : '上传文档'}
          </button>
        </div>
        
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">上传进度: {Math.round(uploadProgress)}%</p>
          </div>
        )}
        
        {selectedDocIds.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-blue-800 dark:text-blue-300">
                已上传 {selectedDocIds.length} 个文档，请解析文档以生成文本块
              </p>
              <button
                onClick={handleParse}
                disabled={isParsing}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isParsing
                    ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                }`}
              >
                {isParsing ? '解析中...' : '解析文档'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 文档列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">文档列表</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400">加载文档...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无文档，请上传文档</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    文档名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    大小
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    文本块数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    上传时间
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{doc.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {doc.chunk_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(doc.status)}`}>
                        {doc.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(doc.created_at)}
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