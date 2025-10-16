// utils/tracking.js
export const trackEvent = (eventName, params = {}) => {
  // Google Analytics (GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      event_category: 'user_journey', // Groups all events
      event_label: 'website_tracking',
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    switch (eventName) {
      case 'page_view':
        window.fbq('track', 'ViewContent'); // Or 'PageView' for basic
        break;
      case 'scroll':
        window.fbq('track', 'Scroll');
        break;
      case 'product_select':
        window.fbq('track', 'AddToCart', {
          content_ids: [params.product_id],
          content_type: 'product',
        });
        break;
      case 'form_start':
        window.fbq('track', 'InitiateCheckout');
        break;
      case 'purchase':
        window.fbq('track', 'Purchase', {
          value: params.value,
          currency: 'BDT',
          content_ids: [params.product_id],
          content_type: 'product',
        });
        break;
      default:
        // Custom events not mapped to FB standards
        break;
    }
  }
};

export const trackFormField = (fieldName) => {
  trackEvent('form_field_filled', { field: fieldName });
};
