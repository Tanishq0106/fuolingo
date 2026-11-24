import { useEffect } from 'react';

const SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || 'https://fuolingo.pages.dev').replace(/\/$/, '');
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION || '';

const META_BY_PAGE = {
  landing: {
    title: 'Fuolingo — The Habit & Streak Engine for Fitness',
    description: 'Build consistent fitness habits with four daily missions, streak shields, progress tracking, and an AI coach that turns your next workout into one clear action.',
    path: '/'
  },
  home: { title: 'Dashboard | Fuolingo', description: 'Complete today’s fitness missions and protect your Fuolingo streak.', path: '/dashboard' },
  coach: { title: 'AI Fitness Coach | Fuolingo', description: 'Get practical, streak-aware fitness habit guidance from the Fuolingo AI Coach.', path: '/coach' },
  workouts: { title: 'Workouts | Fuolingo', description: 'Choose a practical workout and keep your daily fitness streak moving.', path: '/workouts' },
  log: { title: 'Weight Log | Fuolingo', description: 'Track weight trends with a calmer, noise-filtered progress view.', path: '/weight-log' },
  profile: { title: 'Profile & Trophy Case | Fuolingo', description: 'Review your fitness milestones, badges, streak shields, and privacy controls.', path: '/profile' },
  contact: { title: 'Contact Fuolingo', description: 'Contact the Fuolingo team about support, partnerships, billing, or product feedback.', path: '/contact' },
  privacy: { title: 'Privacy Policy | Fuolingo', description: 'Learn how Fuolingo handles account, fitness, payment, and AI Coach data.', path: '/privacy' }
};

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) { tag = document.createElement('meta'); tag.name = name; document.head.appendChild(tag); }
  tag.content = content;
}
function setProperty(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag); }
  tag.content = content;
}
function track(eventName, params = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
}

export function SiteMeta({ page = 'landing' }) {
  useEffect(() => {
    const meta = META_BY_PAGE[page] || META_BY_PAGE.landing;
    const url = `${SITE_URL}${meta.path}`;
    document.title = meta.title;
    setMeta('description', meta.description);
    setMeta('robots', 'index,follow,max-image-preview:large');
    if (GSC_VERIFICATION) setMeta('google-site-verification', GSC_VERIFICATION);
    setProperty('og:title', meta.title);
    setProperty('og:description', meta.description);
    setProperty('og:type', 'website');
    setProperty('og:url', url);
    setProperty('og:image', `${SITE_URL}/og-image.svg`);
    setProperty('og:site_name', 'Fuolingo');
    setProperty('twitter:card', 'summary_large_image');
    setProperty('twitter:title', meta.title);
    setProperty('twitter:description', meta.description);
    setProperty('twitter:image', `${SITE_URL}/og-image.svg`);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;
    let schema = document.getElementById('fuolingo-page-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'fuolingo-page-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', name: 'Fuolingo', url: SITE_URL, logo: `${SITE_URL}/og-image.svg`, sameAs: [] }, { '@type': 'WebSite', name: 'Fuolingo', url: SITE_URL, description: meta.description, potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Fuolingo', item: `${SITE_URL}/` }, ...(meta.path !== '/' ? [{ '@type': 'ListItem', position: 2, name: meta.title.split(' | ')[0], item: url }] : [])] }] });
  }, [page]);
  return null;
}

export function AnalyticsScript() {
  useEffect(() => {
    if (!GA_ID || document.getElementById('fuolingo-ga-script')) return;
    const script = document.createElement('script');
    script.id = 'fuolingo-ga-script'; script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', GA_ID, { anonymize_ip: true });
  }, []);
  return null;
}

export { track, SITE_URL };
