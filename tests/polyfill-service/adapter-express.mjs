import { deepStrictEqual, match, notStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { promisify } from 'node:util';
import compression from 'compression';
import express from 'express';
import polyfillService from '@core-js/polyfill-service/express';
import createAdapter from '../../packages/core-js-polyfill-service/internals/ui/adapter/express.js';

const SCOPE = ['es.array.at', 'es.object.group-by', 'es.string.replace-all', 'es.iterator.map'];
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/143.0.0.0 Safari/537.36';
const IE = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';
// long enough for `compression` to bother with it - it leaves anything under a kilobyte alone
const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>a page</title></head><body>${
  '<p>filler</p>'.repeat(120) }</body></html>`;

// only the beginning of a response is held and decoded; the rest leaves as it arrived. this page
// puts a two-byte character exactly across that boundary, where a decode of the held part alone
// would replace the half of it that is inside. the character is written as an escape so that the
// source itself stays ASCII - what reaches the response is the same two bytes either way
const HTML_PREFIX = 4096;
const OPENING = '<!doctype html><html><head><meta charset="utf-8">';
const LONG_PAGE = `${ OPENING }${ '.'.repeat(HTML_PREFIX - OPENING.length - 1) }\u044F</head><body>ok</body></html>`;

async function serve(build) {
  const reported = [];
  const app = express();

  build(app, options => polyfillService({ scope: SCOPE, warn: message => reported.push(message), ...options }));

  const server = app.listen(0);

  await new Promise(resolve => server.once('listening', resolve));

  const { port } = server.address();

  return {
    reported,
    async get(path, headers, method = 'GET') {
      return fetch(`http://127.0.0.1:${ port }${ path }`, { headers, method });
    },
    async close() {
      server.closeAllConnections();
      await promisify(server.close.bind(server))();
    },
  };
}

function srcOf(markup) {
  return /<script src="(?<src>[^"]+)"><\/script>/.exec(markup)?.groups.src ?? null;
}

// the ordinary arrangement: the middleware after `compression`, an HTML page and a JSON endpoint
const site = await serve((app, middleware) => {
  app.use(compression());
  app.use(middleware());
  app.get('/', (request, response) => response.type('html').send(PAGE));
  app.get('/data', (request, response) => response.json({ ok: true }));
  app.get('/chunked', (request, response) => {
    response.type('html');
    response.write('<!doctype html><html><head>');
    response.write('<meta charset="utf-8"><title>streamed</title></head><body>');
    response.end('</body></html>');
  });
  // `res.write` takes a Uint8Array as readily as a string, and encoders and stream pipes hand it one
  app.get('/bytes', (request, response) => {
    response.type('html');
    response.write(new TextEncoder().encode('<!doctype html><html><head><meta charset="utf-8">'));
    response.end(new TextEncoder().encode('<title>\u0431\u0430\u0439\u0442\u044B</title></head><body>x</body></html>'));
  });
  // an HTML response with no body at all
  app.get('/empty', (request, response) => response.type('html').end());
  // a page longer than the scanned prefix, with a multi-byte character straddling its boundary
  app.get('/long', (request, response) => response.type('html').send(LONG_PAGE));
});

try {
  const page = await site.get('/', { 'user-agent': CHROME });
  const markup = await page.text();
  const src = srcOf(markup);

  // the tag over a real response: after the charset declaration, and before anything of the
  // application
  ok(src !== null, 'adapter #1');
  match(markup, /<meta charset="utf-8"><script src="\/__core-js\/[\da-f]+\.js"><\/script><title>/, 'adapter #2');

  // the headers the insertion made wrong are gone. `Content-Length` no longer matches the body,
  // and Express computed the `ETag` from the body BEFORE the edit
  strictEqual(page.headers.get('content-length'), null, 'adapter-2 #1');
  strictEqual(page.headers.get('etag'), null, 'adapter-2 #2');

  // registered after `compression`, we saw the body first - and the response still reaches the
  // client compressed
  strictEqual(page.headers.get('content-encoding'), 'gzip', 'adapter-1 #1');
  deepStrictEqual(site.reported, [], 'adapter-1 #2');

  // a visitor at the other end of the floor is sent to another bundle
  const old = await site.get('/', { 'user-agent': IE });

  notStrictEqual(srcOf(await old.text()), src, 'adapter #3');

  // the bundle itself
  const bundle = await site.get(src, { 'user-agent': CHROME, 'accept-encoding': 'gzip' });
  const bytes = Buffer.from(await bundle.arrayBuffer());

  strictEqual(bundle.status, 200, 'adapter #4');
  strictEqual(bundle.headers.get('content-type'), 'text/javascript; charset=utf-8', 'adapter #5');
  strictEqual(bundle.headers.get('cache-control'), 'public, max-age=31536000, immutable', 'adapter #6');
  strictEqual(bundle.headers.get('vary'), 'accept-encoding', 'adapter #7');
  ok(bundle.headers.get('etag').includes('gzip'), 'adapter #8');
  // fetch decompresses on its own, so what arrives is the script
  ok(bytes.toString('utf8').includes('core-js'), 'adapter #9');

  const revalidated = await site.get(src, { 'if-none-match': bundle.headers.get('etag'), 'accept-encoding': 'gzip' });

  strictEqual(revalidated.status, 304, 'adapter #10');

  // an identifier nobody planned is a 404 and nothing else
  strictEqual((await site.get('/__core-js/0123456789abcdef.js')).status, 404, 'serve-2 #3');

  // a response that is not HTML is not touched, and neither is its `Content-Length`
  const data = await site.get('/data');

  strictEqual(await data.text(), '{"ok":true}', 'adapter #11');
  strictEqual(data.headers.get('etag') === null, false, 'adapter #12');

  // a response written in pieces: the prefix is buffered, the tag goes in, the rest streams
  const streamed = await site.get('/chunked', { 'user-agent': CHROME });
  const streamedMarkup = await streamed.text();

  match(streamedMarkup, /<meta charset="utf-8"><script src="\/__core-js\/[\da-f]+\.js"><\/script><title>/,
    'adapter #13');
  ok(streamedMarkup.endsWith('</body></html>'), 'adapter #14');

  // a chunk that is a Uint8Array rather than a Buffer or a string: `String(view)` would turn it
  // into the comma-separated list of its byte VALUES, destroying the response rather than
  // mis-decoding it
  const encoded = await site.get('/bytes', { 'user-agent': CHROME });
  const bytesMarkup = await encoded.text();

  match(bytesMarkup, /<meta charset="utf-8"><script src="\/__core-js\/[\da-f]+\.js"><\/script><title>/,
    'adapter #15');
  ok(bytesMarkup.includes('<title>\u0431\u0430\u0439\u0442\u044B</title>'), 'adapter #16');

  // a response with no body is not given one: an empty page holding nothing but our tag is not a
  // page, and a 304 with a body is a protocol violation
  const empty = await site.get('/empty', { 'user-agent': CHROME });

  strictEqual(await empty.text(), '', 'adapter #17');
  strictEqual(empty.status, 200, 'adapter #18');

  // the body past the scanned beginning comes through byte for byte, boundary character included
  const long = await site.get('/long', { 'user-agent': CHROME });
  const longMarkup = await long.text();

  strictEqual(longMarkup.replace(/<script src="\/__core-js\/[\da-f]+\.js"><\/script>/, ''), LONG_PAGE,
    'adapter #19');
  ok(longMarkup.includes('\u044F</head>'), 'adapter #20');

  // the route answers a HEAD as it answers a GET, minus the body
  const head = await site.get(src, { method: 'HEAD' }, 'HEAD');

  strictEqual(head.status, 200, 'adapter #21');
  strictEqual(await head.text(), '', 'adapter #22');
  strictEqual(head.headers.get('etag'), bundle.headers.get('etag'), 'adapter #23');

  // the page Express generates for a route nobody wrote is HTML as well, and it carries
  // `default-src 'none'`. a browser asks for `/favicon.ico` on its own, so a tag there - and a
  // complaint about a policy the developer never wrote - would greet every first visit
  const missing = await site.get('/nothing-here', { 'user-agent': CHROME });

  strictEqual(missing.status, 404, 'adapter #24');
  strictEqual(srcOf(await missing.text()), null, 'adapter #25');
  deepStrictEqual(site.reported, [], 'adapter #26');
} finally {
  try {
    await site.close();
  } catch (error) {
    // a server left listening cannot break a run, and a failure to close it must not speak for the
    // assertions above
    console.warn(`could not close the test server: ${ error.message }`);
  }
}

// and the arrangement that reads right and is wrong: registered BEFORE `compression`, we are
// handed bytes that are already gzip. nothing can be inserted, and without the check the failure
// is completely silent - a site with no polyfills anywhere and no error to show for it
const backwards = await serve((app, middleware) => {
  app.use(middleware());
  app.use(compression());
  app.get('/', (request, response) => response.type('html').send(PAGE));
});

try {
  const page = await backwards.get('/', { 'user-agent': CHROME, 'accept-encoding': 'gzip' });
  const markup = await page.text();

  strictEqual(srcOf(markup), null, 'adapter-1 #3');
  strictEqual(backwards.reported.length, 1, 'adapter-1 #4');
  match(backwards.reported[0], /register this middleware AFTER `compression`/, 'adapter-1 #5');
  // and the page itself survives it: what the visitor gets is the page as it was written
  ok(markup.includes('<title>a page</title>'), 'adapter-1 #6');
} finally {
  try {
    await backwards.close();
  } catch (error) {
    console.warn(`could not close the test server: ${ error.message }`);
  }
}

// a baseline that could not be built takes the page out of OUR hands, not out of the visitor's:
// the response is served exactly as it would be without this middleware. driven directly, because
// a builder that fails is not something the suite can arrange
const reported = [];
const broken = createAdapter({
  config: { route: '/__core-js' },
  warn(condition) { reported.push(condition); return true; },
  start: () => ({ ready: Promise.reject(new Error('rolldown said no')) }),
  chooseBundle: () => { throw new Error('the tag must not be built at all'); },
  urlOf: id => `/__core-js/${ id }.js`,
  scriptTag: () => { throw new Error('the tag must not be built at all'); },
  async serve() { /* the bundle route is not what this case is about */ },
});

const untouched = {
  getHeader: () => 'text/html',
  removeHeader() { /* nothing is inserted, so nothing is removed */ },
  write: null,
  end: null,
};
const write = untouched.write = () => true;
const end = untouched.end = () => true;
let passed = false;

await broken({ headers: {}, path: '/', url: '/' }, untouched, () => { passed = true; });

strictEqual(passed, true, 'adapter #24');
deepStrictEqual(reported, ['adapter:no-baseline'], 'adapter #25');
// the response was left alone: nothing of ours is in the way of the application's own writes
strictEqual(untouched.write, write, 'adapter #26');
strictEqual(untouched.end, end, 'adapter #27');

// the middleware carries the service it runs on: a status endpoint, a second router or a warm-up
// started by hand would otherwise have to build a second service, with a plan and a warm-up of its own
const carrier = polyfillService({ scope: SCOPE });

strictEqual(typeof carrier.service.chooseBundle({ 'user-agent': CHROME }), 'string', 'adapter #28');
strictEqual(carrier.service.urlOf(carrier.service.plan.baseline.bundleId),
  `/__core-js/${ carrier.service.plan.baseline.bundleId }.js`, 'adapter #29');
