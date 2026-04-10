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

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // 301-redirect www to non-www
    var host = request.headers && request.headers.host && request.headers.host.value;
    if (host && host.startsWith('www.')) {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                location: { value: 'https://vitalguide.life' + uri }
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

    // If no extension, append .html
    if (!uri.includes('.')) {
        request.uri = uri + '.html';
    }

    return request;
}
