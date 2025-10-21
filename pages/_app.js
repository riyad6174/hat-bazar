import '@/styles/globals.css';
import { useEffect } from 'react';
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

  return <Component {...pageProps} />;
}
