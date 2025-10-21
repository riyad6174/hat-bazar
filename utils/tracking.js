// utils/tracking.js
export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
      // Common params for all events (GA4/FB compatible)
      event_category: 'user_journey',
      event_label: eventName,
    });
  }
};

export const trackFormField = (fieldName) => {
  trackEvent('form_field_filled', { field: fieldName });
};

// Optional: Track page views with title (call from router events if needed)
export const trackPageView = (pageTitle = document.title) => {
  trackEvent('page_view', { page_title: pageTitle });
};
