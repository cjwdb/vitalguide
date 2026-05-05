var KEEP_HTML = [
    '/about.html',
    '/privacy-policy.html',
    '/affiliate-disclosure.html',
    '/how-we-review.html',
    '/contact.html'
];

// Known directory paths that should resolve to their index.html
var DIRECTORY_PATHS = [
    '/articles'
];

// Known root-level pages (without .html extension)
var ROOT_PAGES = [
    '/fitness',
    '/health-tech',
    '/health-technology',
    '/mental-wellness',
    '/sleep',
    '/sports-nutrition',
    '/supplements',
    '/wellness',
    '/about',
    '/privacy-policy',
    '/affiliate-disclosure',
    '/how-we-review',
    '/contact',
    '/404'
];

// Old article slugs that were renamed — 301 redirect to canonical URL
var SLUG_REDIRECTS = {
    '/articles/beta-alanine-performance': '/articles/beta-alanine-guide',
    '/articles/breathwork-anxiety': '/articles/breathwork-guide',
    '/articles/chronotype-sleep-optimization': '/articles/circadian-rhythm-guide',
    '/articles/dopamine-detox-guide': '/articles/digital-detox-guide',
    '/articles/oura-vs-whoop-comparison': '/articles/smart-ring-guide',
    '/articles/rucking-benefits': '/articles/rucking-guide',
    '/articles/sleep-debt-recovery': '/articles/sleep-stack-guide',
    '/articles/tongkat-ali-benefits': '/articles/tongkat-ali-guide'
};

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // 301-redirect www to non-www (also strip .html to avoid double redirect chain)
    var host = request.headers && request.headers.host && request.headers.host.value;
    if (host && host.startsWith('www.')) {
        var target = uri;
        if (target.endsWith('.html') && KEEP_HTML.indexOf(target) === -1) {
            target = target.slice(0, -5);
        }
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                location: { value: 'https://vitalguide.life' + target }
            }
        };
    }

    // 301-redirect old article slugs to their canonical replacements
    if (SLUG_REDIRECTS[uri]) {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                location: { value: 'https://vitalguide.life' + SLUG_REDIRECTS[uri] }
            }
        };
    }

    // Handle root
    if (uri === '/') {
        request.uri = '/index.html';
        return request;
    }

    // Handle directory-style URLs with trailing slash (e.g. /articles/)
    if (uri.endsWith('/')) {
        request.uri = uri + 'index.html';
        return request;
    }

    // Handle known directory paths without trailing slash (e.g. /articles)
    if (DIRECTORY_PATHS.indexOf(uri) !== -1) {
        request.uri = uri + '/index.html';
        return request;
    }

    // 301-redirect *.html to extensionless (except static info pages)
    if (uri.endsWith('.html') && KEEP_HTML.indexOf(uri) === -1) {
        var extensionless = uri.slice(0, -5);
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                location: { value: extensionless }
            }
        };
    }

    // If no extension, resolve to .html file
    if (!uri.includes('.')) {
        // URIs already under /articles/ stay as-is
        if (uri.startsWith('/articles/')) {
            request.uri = uri + '.html';
        }
        // Known root-level pages resolve at root
        else if (ROOT_PAGES.indexOf(uri) !== -1) {
            request.uri = uri + '.html';
        }
        // Everything else is an article shortcut URL — rewrite to /articles/
        else {
            request.uri = '/articles' + uri + '.html';
        }
    }

    return request;
}
