import '@/styles/globals.css';
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { trackEvent, trackPageView } from '@/utils/tracking';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Page View on route change (for SPA navigation)
    const handleRouteChange = (url) => {
      trackPageView(`Page: ${router.pathname}`);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    // Initial load
    trackPageView();

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
    <>
      <Head>
        <title>Hatbazar - Gluta Collagen Pink Dietary Supplement</title>
        <meta
          name='description'
          content='Discover Gluta Collagen Pink, a premium dietary supplement designed to enhance skin health, promote collagen production, and support radiant, youthful skin. Shop now for natural beauty from within.'
        />
        <meta
          property='og:title'
          content='Hatbazar Gluta Collagen Pink Dietary Supplement'
        />
        <meta
          property='og:description'
          content='Discover Gluta Collagen Pink, a premium dietary supplement designed to enhance skin health, promote collagen production, and support radiant, youthful skin. Shop now for natural beauty from within.'
        />
        <meta property='og:image' content='/assets/model2.jpg' />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://www.hatbazar.live/' />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
