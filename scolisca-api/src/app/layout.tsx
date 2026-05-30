import './globals.css'

export const metadata = {
  title: 'ScoliSca 管理后台',
  description: '脊柱筛查数据管理中心',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}
