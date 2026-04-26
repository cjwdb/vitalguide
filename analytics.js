/**
 * VitalGuide — Affiliate click tracking & UTM injection
 *
 * Fires a GA4 `affiliate_click` event on every Amazon link click and
 * appends UTM parameters so traffic shows up correctly in GA4 reports.
 */
(function () {
  // Derive page category from the URL path, e.g. /supplements → "supplements"
  function getCategory() {
    var path = window.location.pathname;
    if (path.includes('/supplements')) return 'supplements';
    if (path.includes('/fitness'))     return 'fitness';
    if (path.includes('/sleep'))       return 'sleep';
    if (path.includes('/mental-wellness')) return 'mental-wellness';
    if (path.includes('/immune-support'))  return 'supplements';
    if (path.includes('/improve-sleep'))   return 'sleep';
    if (path.includes('/home-gym-guide'))  return 'fitness';
    if (path.includes('/mindfulness-guide')) return 'mental-wellness';
    return 'general';
  }

  // Slugify a product name for utm_content
  function toSlug(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  // Append UTM parameters to an Amazon URL
  function addUtm(url, productSlug, category) {
    try {
      var u = new URL(url);
      u.searchParams.set('utm_source', 'vitalguide.life');
      u.searchParams.set('utm_medium', 'affiliate');
      u.searchParams.set('utm_campaign', category + '-reviews');
      u.searchParams.set('utm_content', productSlug);
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var category = getCategory();
    var links = document.querySelectorAll('a.btn-amazon, a[rel~="sponsored"]');

    links.forEach(function (link) {
      // Get product name from closest h3 inside the same product card
      var card = link.closest('.product-card, .comparison-col');
      var nameEl = card ? card.querySelector('h3, .comp-name') : null;
      var productName = nameEl ? nameEl.textContent.trim() : link.textContent.trim();
      var productSlug = toSlug(productName);
      var originalUrl = link.getAttribute('href');

      // Inject UTM params into the href
      link.setAttribute('href', addUtm(originalUrl, productSlug, category));

      // Fire GA4 event on click
      link.addEventListener('click', function (e) {
        if (typeof gtag === 'function') {
          gtag('event', 'affiliate_click', {
            product_name: productName,
            product_category: category,
            destination_url: originalUrl,
            event_category: 'affiliate',
            event_label: productName
          });
        }
      });
    });
  });
})();
