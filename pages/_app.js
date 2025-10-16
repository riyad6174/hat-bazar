import '@/styles/globals.css';
import { useEffect } from 'react';
import { trackEvent } from '@/utils/tracking'; // Add this import

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // First visit / Page View (fires on every page load)
    trackEvent('page_view');

    // Scroll tracking (50% scroll depth)
    let scrolled = false;
    const handleScroll = () => {
      if (
        !scrolled &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight * 0.5
      ) {
        trackEvent('scroll');
        scrolled = true;
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Leave without purchase (fires on page visibility change or unload)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackEvent('page_leave_no_purchase');
      }
    };
    const handleBeforeUnload = () => {
      trackEvent('page_leave_no_purchase');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <Component {...pageProps} />;
}
