export const metadata = {
  title: 'Task Manager',
  description: 'Simple task manager built with Next.js and tRPC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
