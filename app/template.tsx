'use client';

// Bu dosya her sayfa geçişinde yeniden bağlanır; böylece sayfa içeriği
// her gezinmede yumuşak bir fade ile gelir. Navbar/Footer (layout'ta) sabit kalır.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
