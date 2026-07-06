// ==UserScript==
// @name         Prime Video → Fortsetzen (v2)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Scrollt automatisch zum „Fortsetzen“-Karussell auf der Prime-Video-Startseite
// @match        *://*.amazon.de/gp/video/storefront*
// @match        *://amazon.de/gp/video/storefront*
// @include      /^https?:\/\/([^/]+\.)?amazon\.[a-z.]+\/gp\/video\/storefront(\/|$|\?)/
// @match        *://*.primevideo.com/*/storefront*
// @match        *://primevideo.com/*/storefront*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // Sicherheitsnetz: nur auf der Startseite ausführen
  const isStorefront =
    /\/gp\/video\/storefront(\/|$|\?)/.test(location.pathname) ||
    /\/storefront(\/|$|\?)/.test(location.pathname);

  if (!isStorefront) return;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const TITLES = /^(Fortsetzen|Continue watching|Zuletzt angesehen|Recently watched)/i;
  const MAX_MS = 45000;
  const start = Date.now();
  let done = false;
  let lastY = -1;
  let stableCount = 0;
  let observer = null;

  function findTarget() {
    for (const title of document.querySelectorAll('[data-testid="carousel-title"]')) {
      if (TITLES.test(title.textContent.trim())) {
        return (
          title.closest('[data-testid="standard-carousel"]') ||
          title.closest('[data-testid="navigation-carousel-wrapper"]') ||
          title.closest('section')
        );
      }
    }
    return null;
  }

  function scrollToTarget() {
    const el = findTarget();
    if (!el) return false;

    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });

    const currentY = window.scrollY;
    if (Math.abs(currentY - lastY) < 5) {
      stableCount++;
    } else {
      stableCount = 0;
    }
    lastY = currentY;

    if (stableCount >= 3) {
      done = true;
      if (observer) observer.disconnect();
    }
    return true;
  }

  function tick() {
    if (done || Date.now() - start > MAX_MS) return;

    const found = scrollToTarget();
    if (!found) {
      window.scrollBy({ top: 600, behavior: 'instant' });
    }

    requestAnimationFrame(tick);
  }

  observer = new MutationObserver(() => {
    if (!done) scrollToTarget();
  });

  function startObserver() {
    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      startObserver();
      requestAnimationFrame(tick);
    });
  } else {
    startObserver();
    requestAnimationFrame(tick);
  }
})();
