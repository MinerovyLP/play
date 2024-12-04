const http = require('http');
const https = require('https');
const url = require('url');

// Helper function to forward requests
function forwardRequest(req, res, protocol) {
    // Extract the URL from the 'url' query parameter
    const queryParams = url.parse(req.url, true).query;
    const targetUrl = queryParams.url;

    if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Missing "url" query parameter');
    }

    const parsedUrl = url.parse(targetUrl);
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (protocol === https ? 443 : 80),
        path: parsedUrl.path,
        method: req.method,
        headers: req.headers,
    };

    delete options.headers['host']; // Avoid host conflicts

    const proxy = protocol.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxy.on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy error');
    });

    req.pipe(proxy, { end: true });
}

// HTTP server
const server = http.createServer((req, res) => {
    forwardRequest(req, res, http);
});

// HTTPS support (optional, requires SSL certs)
const enableHttps = false; // Set true to enable HTTPS
let httpsServer;
if (enableHttps) {
    const fs = require('fs');
    const path = require('path');
    const options = {
        key: fs.readFileSync(path.join(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
    };
    httpsServer = https.createServer(options, (req, res) => {
        forwardRequest(req, res, https);
    });
}

// Start server
const PORT = 10000;
server.listen(PORT, () => {
    console.log(`HTTP proxy server is running on http://localhost:${PORT}`);
});

if (enableHttps) {
    const HTTPS_PORT = 10000;
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`HTTPS proxy server is running on https://localhost:${HTTPS_PORT}`);
    });
}
