"use client";

import { RagFlowClient } from "@qzsy/ragflow-sdk";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatusCard from "./components/StatusCard";
import { getClient } from "./config";

// 功能介绍卡片组件
function FeatureCard({ 
  title, 
  description, 
  icon, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: string;
  href: string;
}) {
  return (
    <Link 
      href={href}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
          <Image src={icon} width={24} height={24} alt={title} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </Link>
  );
}

export default function Home() {
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [datasetsCount, setDatasetsCount] = useState<number | null>(null);

  useEffect(() => {
    const initRagFlow = async () => {
      try {
        const client = getClient();
        
        // 尝试获取数据集列表以验证连接
        const datasets = await client.datasets.list();
        setDatasetsCount(datasets.length);
        setSdkStatus('success');
      } catch (error) {
        console.error("RagFlow 客户端创建失败", error);
        setSdkStatus('error');
      }
    };

    initRagFlow();
  }, []);

  const features = [
    {
      title: "数据集管理",
      description: "创建、浏览和管理您的知识库数据集，组织您的文档资源。",
      icon: "/database.svg", 
      href: "/datasets"
    },
    {
      title: "文档管理",
      description: "上传、解析和管理文档，让AI理解您的业务知识。",
      icon: "/document.svg",
      href: "/documents"
    },
    {
      title: "知识检索",
      description: "基于语义相似度，精准检索您知识库中的相关信息。",
      icon: "/search.svg",
      href: "/retrieval"
    },
    {
      title: "聊天助手",
      description: "利用您的知识库创建专属AI助手，回答特定领域问题。",
      icon: "/chat.svg",
      href: "/chat"
    },
    {
      title: "智能代理",
      description: "部署可执行复杂任务的AI代理，自动化您的业务流程。",
      icon: "/agents.svg",
      href: "/agents"
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">RagFlow SDK 功能演示</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          构建基于您自有数据的AI应用，从上传文档到部署智能代理，一站式解决方案
        </p>
        
        {/* SDK 连接状态 */}
        <div className="mt-6 max-w-2xl mx-auto">
          {sdkStatus === 'loading' && (
            <StatusCard 
              type="loading" 
              title="连接中" 
              message="正在连接 RagFlow 服务..."
            />
          )}
          {sdkStatus === 'success' && (
            <StatusCard 
              type="success" 
              title="连接成功" 
              message={`已成功连接 RagFlow 服务！找到 ${datasetsCount} 个数据集`}
            />
          )}
          {sdkStatus === 'error' && (
            <StatusCard 
              type="error" 
              title="连接失败" 
              message="连接 RagFlow 服务失败，请检查配置或网络连接。将使用模拟数据进行演示。"
            />
          )}
        </div>
      </div>

      {/* 功能展示区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            href={feature.href}
          />
        ))}
      </div>

      {/* 快速入门指南 */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">快速入门指南</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <ol className="list-decimal pl-5 space-y-4 text-gray-700 dark:text-gray-300">
            <li>
              <strong className="text-gray-900 dark:text-white">创建数据集</strong> - 首先访问"数据集管理"创建新的知识库
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">上传文档</strong> - 进入数据集后，通过"文档管理"上传并解析您的文档
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">知识检索</strong> - 使用"知识检索"功能测试您的知识库
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">构建应用</strong> - 基于您的知识库创建聊天助手或智能代理
            </li>
          </ol>
          <div className="mt-6 text-center">
            <Link href="/datasets" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
              开始体验
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
