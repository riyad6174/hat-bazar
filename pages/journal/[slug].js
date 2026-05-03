import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import journalData from '@/data/journal.json';
import Head from 'next/head';
import Link from 'next/link';

export default function JournalDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const article = journalData.find(a => a.slug === slug);

  if (!article && router.isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="font-display text-2xl">Article not found</h1>
        <Link href="/" className="text-primary mt-4">Back Home</Link>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Head>
        <title>{article.title} | Hat Bazar Journal</title>
        <meta name="description" content={article.excerpt} />
      </Head>
      
      <Navbar />
      
      <main className="flex-grow py-16 md:py-32">
        <article className="max-w-[800px] mx-auto px-6">
          <header className="mb-12 text-center">
            <span className="font-body text-xs font-bold text-primary tracking-[0.2em] uppercase mb-4 block">The Journal</span>
            <h1 className="font-display text-4xl md:text-6xl text-on-surface leading-tight mb-6">{article.title}</h1>
            <div className="flex items-center justify-center gap-4 text-tertiary font-body text-sm">
              <span>{article.date}</span>
              <span className="w-1 h-1 bg-outline rounded-full"></span>
              <span>By {article.author}</span>
            </div>
          </header>

          <div className="aspect-[16/9] rounded-[2rem] overflow-hidden mb-16 shadow-2xl">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg max-w-none font-body text-tertiary leading-relaxed space-y-8">
            {article.content.split('\n').map((para, i) => {
              if (para.startsWith('###')) {
                return <h3 key={i} className="font-display text-2xl md:text-3xl text-on-surface pt-8">{para.replace('###', '')}</h3>;
              }
              if (para.startsWith('![')) {
                const match = para.match(/!\[(.*?)\]\((.*?)\)/);
                return <img key={i} src={match[2]} alt={match[1]} className="rounded-2xl w-full my-8" />;
              }
              if (para.startsWith('-')) {
                return <li key={i} className="ml-6">{para.replace('-', '').trim()}</li>;
              }
              return <p key={i}>{para}</p>;
            })}
          </div>

          <footer className="mt-24 pt-12 border-t border-surface-dim flex justify-between items-center">
             <Link href="/" className="font-body text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Journal
             </Link>
             <div className="flex gap-4">
               {/* Social Share Placeholder */}
                <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">share</span>
             </div>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}
