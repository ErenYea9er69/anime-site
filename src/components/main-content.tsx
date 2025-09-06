// Create a new client component
'use client';
import { usePathname } from 'next/navigation';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    <main className={`flex-1 ${isHomePage ? '' : 'pt-14 sm:pt-16'}`}>
      {children}
    </main>
  );
}
