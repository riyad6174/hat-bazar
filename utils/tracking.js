const ECOMMERCE_EVENTS = ['view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'remove_from_cart'];

export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    // GA4 requires clearing ecommerce before each ecommerce event to prevent data bleed
    if (ECOMMERCE_EVENTS.includes(eventName)) {
      window.dataLayer.push({ ecommerce: null });
    }
    window.dataLayer.push({ event: eventName, ...params });
  }
};

export const trackFormField = (fieldName) => {
  trackEvent('form_field_filled', { field: fieldName });
};

export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: path || window.location.pathname,
      page_location: window.location.href,
      page_title: title || document.title,
    });
  }
};
