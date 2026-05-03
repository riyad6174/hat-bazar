import '@/styles/globals.css';
import { useEffect } from 'react';
import { Cormorant_Garamond, Inter, Noto_Serif_Bengali } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const noto = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
  preload: false,
});
import Head from 'next/head';
import { useRouter } from 'next/router';
import { trackEvent, trackPageView } from '@/utils/tracking';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import CartDrawer from '@/components/CartDrawer';
import FloatingCart from '@/components/FloatingCart';
import { AnimatePresence, motion } from 'framer-motion';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Page View on route change (for SPA navigation)
    const handleRouteChange = (url) => {
      trackPageView(router.pathname, document.title);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    // Initial load
    trackPageView(router.pathname, document.title);

    // Scroll tracking (50% depth)
    let scrolled = false;
    const handleScroll = () => {
      if (
        !scrolled &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight * 0.5
      ) {
        trackEvent('scroll_50', { depth: '50%' });
        scrolled = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Leave intent (visibility + unload)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackEvent('session_end', { reason: 'visibility_hidden' });
      }
    };
    const handleBeforeUnload = () => {
      trackEvent('session_end', { reason: 'unload' });
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router.events, router.pathname]);

  return (
    <div className={`${cormorant.variable} ${inter.variable} ${noto.variable}`}>
    <CartProvider>
      <Head>
        <title>Hat Bazar | Premium Organic Skincare & Wellness</title>
        <meta
          name='description'
          content='Discover premium organic skincare and wellness products. Hat Bazar offers natural solutions for your daily skincare routine and overall health.'
        />
        <meta
          property='og:title'
          content='Hat Bazar | Premium Organic Skincare & Wellness'
        />
        <meta
          property='og:description'
          content='Experience natural beauty and wellness with our curated collection of botanical products.'
        />
        <meta property='og:image' content='/assets/hero-og.jpg' />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://www.hatbazar.live/' />
      </Head>
      <Toaster position="bottom-center" />
      <CartDrawer />
      {router.pathname !== '/checkout' && <FloatingCart />}
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </CartProvider>
    </div>
  );
}
