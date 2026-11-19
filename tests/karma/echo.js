'use strict';
module.exports = function createEchoMiddleware() {
  const beacons = new Map();
  return (request, response, next) => {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname !== '/core-js-echo') return next();
    const id = url.searchParams.get('beacon');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/json');
    if (request.method === 'GET' && id) {
      const result = beacons.get(id);
      beacons.delete(id);
      response.statusCode = result ? 200 : 204;
      response.end(result && JSON.stringify(result));
    } else {
      let body = '';
      request.setEncoding('utf8');
      request.on('data', chunk => { body += chunk; });
      request.on('end', () => {
        const result = { body, contentType: request.headers['content-type'] || null, method: request.method };
        if (id) beacons.set(id, result);
        response.end(JSON.stringify(result));
      });
    }
  };
};
