import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarkov Task Tracker',
  description: 'Escape from Tarkov タスク進捗管理ツール',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
