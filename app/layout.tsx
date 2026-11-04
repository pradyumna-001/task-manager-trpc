import type { AppRouter } from '@/server/trpc/router';
import { TrpcProvider } from '@/app/_trpc/provider';
import '@/app/globals.css';

export const metadata = {
  title: 'Task Manager',
  description: 'Simple task manager built with Next.js and tRPC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}