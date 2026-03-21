import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/sonner'
import { RoleProvider } from '@/lib/role-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Brand Deal Manager',
  description: 'The agency-grade deal pipeline for influencer marketing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <RoleProvider>
          {children}
        </RoleProvider>
        <Toaster />
      </body>
    </html>
  )
}
