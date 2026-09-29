import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { HistoryProvider } from "@/context/HistoryContext";
import { ListsProvider } from '@/context/ListsContext';
import { MainContent } from '@/components/main-content';
import AuthProvider from '@/components/providers/auth-provider';
import QueryProvider from '@/components/providers/query-provider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tsune - Modern Anime Streaming',
  description: 'Ad-free anime discovery and streaming experience with rich catalogs, personalized tracking, and modern UI.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const revalidate = 3600; // Revalidate every hour

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary`}>
        <AuthProvider>
          <ListsProvider>
            <HistoryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <div className="relative flex min-h-screen flex-col">
                  <Navbar />
                  <QueryProvider>
                    <MainContent>
                      {children}
                    </MainContent>
                  </QueryProvider>
                  <Toaster position="bottom-right" richColors theme="system" />
                </div>
              </ThemeProvider>
            </HistoryProvider>
          </ListsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
