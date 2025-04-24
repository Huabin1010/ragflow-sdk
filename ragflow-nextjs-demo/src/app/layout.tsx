import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RagFlow SDK 演示',
  description: '基于RagFlow SDK的功能展示',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <nav className="bg-slate-800 text-white p-4">
          <div className="container mx-auto flex flex-wrap items-center justify-between">
            <div className="font-bold text-xl">RagFlow SDK 演示</div>
            <div className="flex space-x-4">
              <Link href="/" className="hover:text-blue-300">首页</Link>
              <Link href="/datasets" className="hover:text-blue-300">数据集管理</Link>
              <Link href="/documents" className="hover:text-blue-300">文档管理</Link>
              <Link href="/retrieval" className="hover:text-blue-300">知识检索</Link>
              <Link href="/chat" className="hover:text-blue-300">聊天助手</Link>
              <Link href="/agents" className="hover:text-blue-300">智能代理</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
