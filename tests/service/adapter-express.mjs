import { deepStrictEqual, match, notStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { promisify } from 'node:util';
import compression from 'compression';
import express from 'express';
import polyfillService from '@core-js/service/express';
import createAdapter from '../../packages/core-js-service/internals/ui/adapter/express.js';

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
  // an application that already varies its pages by the visitor, as server-side device detection does
  app.get('/varied', (request, response) => response.type('html').vary('User-Agent').send(PAGE));
  // and one that declares its headers the other way: `writeHead` puts them on the wire before the
  // body is written, so from the flush onwards none of them can be repaired
  app.get('/sent', (request, response) => {
    response.setHeader('content-type', 'text/html; charset=utf-8');
    response.setHeader('content-length', Buffer.byteLength(PAGE));
    response.writeHead(200);
    response.end(PAGE);
  });
  // the same call carrying the type, which is how a bare Node handler writes one. `getHeader` does
  // not see what went through `writeHead`, so the response never looks like HTML from in here
  app.get('/undeclared', (request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(PAGE);
  });
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

  // and the header the insertion made INCOMPLETE: the address in the tag was chosen by the
  // `User-Agent`, so the page stopped being one document for every visitor. `compression` adds its
  // own field on the way out - we are outside it - and both have to be there
  strictEqual(page.headers.get('vary'), 'user-agent, Accept-Encoding', 'adapter-2 #3');

  // registered after `compression`, we saw the body first - and the response still reaches the
  // client compressed
  strictEqual(page.headers.get('content-encoding'), 'gzip', 'adapter-1 #1');
  deepStrictEqual(site.reported, [], 'adapter-1 #2');

  // an application that says it already varies by the visitor is not told twice
  const varied = await site.get('/varied', { 'user-agent': CHROME });

  ok(srcOf(await varied.text()) !== null, 'adapter-2 #4');
  strictEqual(varied.headers.get('vary'), 'User-Agent, Accept-Encoding', 'adapter-2 #5');

  // nothing was inserted into a response with no body, so nothing of ours is said about it either
  const nothing = await site.get('/empty', { 'user-agent': CHROME });

  strictEqual((await nothing.text()).length, 0, 'adapter-2 #6');
  strictEqual((nothing.headers.get('vary') ?? '').toLowerCase().includes('user-agent'), false, 'adapter-2 #7');

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

  strictEqual(missing.status, 404, 'adapter #34');
  strictEqual(srcOf(await missing.text()), null, 'adapter #35');
  deepStrictEqual(site.reported, [], 'adapter #36');

  // headers already on the wire: the tag would leave `Content-Length` describing a shorter body,
  // and the client would be handed the page cut off at that length. So the page goes out whole and
  // without a tag, and the developer is told which call did it
  const sent = await site.get('/sent', { 'user-agent': CHROME });
  const sentMarkup = await sent.text();

  strictEqual(sentMarkup, PAGE, 'adapter-2 #8');
  strictEqual(srcOf(sentMarkup), null, 'adapter-2 #9');
  strictEqual(site.reported.length, 1, 'adapter-2 #10');
  match(site.reported[0], /`res.setHeader` rather than `res.writeHead`/, 'adapter-2 #11');

  // and the miss that says nothing at all without this: the page is whole, has no tag, and the only
  // way anyone learns that the polyfills never arrived is that the document begins like one
  const undeclared = await site.get('/undeclared', { 'user-agent': CHROME });
  const undeclaredMarkup = await undeclared.text();

  strictEqual(undeclaredMarkup, PAGE, 'adapter-2 #12');
  strictEqual(srcOf(undeclaredMarkup), null, 'adapter-2 #13');
} finally {
  try {
    await site.close();
  } catch (error) {
    // a server left listening cannot break a run, and a failure to close it must not speak for the
    // assertions above
    console.warn(`could not close the test server: ${ error.message }`);
  }
}

// mounted under a path, which is how a service gets added to an application that already has its
// own routing. A router strips its own path from everything it hands on, so the address the tag
// carries has to be written from the mount point and not from the root
const mounted = await serve((app, middleware) => {
  app.use('/app', middleware());
  app.get('/app', (request, response) => response.type('html').send(PAGE));
});

try {
  const page = await mounted.get('/app', { 'user-agent': CHROME });
  const src = srcOf(await page.text());

  ok(src.startsWith('/app/'), `adapter-5 #1: the tag says ${ src }`);

  const bundle = await mounted.get(src, { 'user-agent': CHROME });

  strictEqual(bundle.status, 200, 'adapter-5 #2');
  strictEqual(bundle.headers.get('content-type'), 'text/javascript; charset=utf-8', 'adapter-5 #3');
  deepStrictEqual(mounted.reported, [], 'adapter-5 #4');
} finally {
  try {
    await mounted.close();
  } catch (error) {
    console.warn(`could not close the test server: ${ error.message }`);
  }
}

// the other way to put the service behind a prefix: mounted at the root, with the prefix inside
// `route`. Both arrangements have to keep working, and this one is what an application already
// carrying its own base path does
const prefixed = await serve((app, middleware) => {
  app.use(middleware({ route: '/app/__core-js' }));
  app.get('/app', (request, response) => response.type('html').send(PAGE));
});

try {
  const page = await prefixed.get('/app', { 'user-agent': CHROME });
  const src = srcOf(await page.text());

  ok(src.startsWith('/app/__core-js/'), `adapter-5 #6: the tag says ${ src }`);

  const bundle = await prefixed.get(src, { 'user-agent': CHROME });

  strictEqual(bundle.status, 200, 'adapter-5 #7');
} finally {
  try {
    await prefixed.close();
  } catch (error) {
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

// a document that was never declared as HTML: `res.writeHead` carries the type past `getHeader`,
// and a response sent with no type at all reads the same way from in here. Nothing is inserted -
// there is nothing to insert into as far as this code can tell - and without the notice the pages
// of a whole application go out with no polyfills and nothing anywhere says why. Driven directly,
// because `compression` copies what went through `writeHead` back into the headers, and the case
// only exists on a stack without it
const undeclared = [];
const bare = createAdapter({
  config: { route: '/__core-js' },
  warn(condition) { undeclared.push(condition); return true; },
  start: () => ({ ready: Promise.resolve() }),
  chooseBundle: () => 'deadbeef',
  urlOf: id => `/__core-js/${ id }.js`,
  scriptTag: () => { throw new Error('nothing is declared HTML, so no tag is ever built'); },
  async serve() { /* the bundle route is not what this case is about */ },
});

const undeclaredResponse = { getHeader: () => undefined, write: () => true, end: () => true };

await bare({ headers: {}, path: '/', url: '/' }, undeclaredResponse, () => { /* the application answers */ });
undeclaredResponse.end(PAGE);

deepStrictEqual(undeclared, ['adapter:undeclared-html'], 'adapter-2 #14');

// and a body that does not begin like a document is exactly what an ordinary endpoint sends: the
// notice is about pages that will never get a tag, not about every response that is not HTML
const json = { getHeader: () => undefined, write: () => true, end: () => true };

await bare({ headers: {}, path: '/', url: '/' }, json, () => { /* the application answers */ });
json.end('{"ok":true}');

deepStrictEqual(undeclared, ['adapter:undeclared-html'], 'adapter-2 #15');

// and the same rule one step later: the baseline is ready, the interception is installed, and the
// tag fails while the application is writing. That throw would leave `res.write` itself throwing
// halfway through a response nobody else can finish - a page without polyfills is a page, a broken
// `res.write` is the site
const said = [];
const failing = createAdapter({
  config: { route: '/__core-js' },
  warn(condition) { said.push(condition); return true; },
  start: () => ({ ready: Promise.resolve(true) }),
  chooseBundle: () => { throw new Error('the plan is gone'); },
  urlOf: id => `/__core-js/${ id }.js`,
  scriptTag: () => { throw new Error('unreachable: the bundle is chosen first'); },
  async serve() { /* not this case */ },
});

const written = [];
const streaming = {
  getHeader: name => name === 'content-type' ? 'text/html; charset=utf-8' : undefined,
  removeHeader() { /* nothing was inserted */ },
  headersSent: false,
  write(chunk) { written.push(Buffer.from(chunk).toString('latin1')); return true; },
  end(chunk) { if (chunk !== undefined) written.push(Buffer.from(chunk).toString('latin1')); return true; },
};

await failing({ headers: {}, path: '/', url: '/' }, streaming, () => { /* the page is ours to serve */ });

const whole = '<!doctype html><html><head><meta charset="utf-8"><title>t</title></head><body>hi</body></html>';

streaming.write(whole);
streaming.end();

// the page came through whole, and untouched
strictEqual(written.join(''), whole, 'adapter #29');
deepStrictEqual(said, ['adapter:tag-failed'], 'adapter #30');

// nothing this middleware does leaves as a rejected promise. Express before 5 does not await what a
// middleware returns, so a rejection is nobody's: Node calls it unhandled and ends the process, and
// a disk that went away while serving one bundle takes the site with it
const failures = [];
const collapsing = createAdapter({
  config: { route: '/__core-js' },
  warn(condition) { failures.push(condition); return true; },
  start() { throw new Error('the plan never built'); },
  chooseBundle: () => 'abc0000000000001',
  urlOf: id => `/__core-js/${ id }.js`,
  scriptTag: beginning => beginning,
  async serve() { throw new Error('the disk went away'); },
});

const forwarded = [];
const quiet = { getHeader: () => 'text/html', removeHeader() { /* nothing was inserted */ } };

// the page: served as it would be without this middleware, with nothing handed to the error chain
await collapsing({ headers: {}, path: '/', url: '/' }, quiet, error => forwarded.push(error));

deepStrictEqual(forwarded, [undefined], 'adapter #31');

// the bundle route: somebody has to answer it, so the framework hears about the failure
const serving = createAdapter({
  config: { route: '/__core-js' },
  warn(condition) { failures.push(condition); return true; },
  start: () => ({ ready: Promise.resolve(true) }),
  chooseBundle: () => 'abc0000000000001',
  urlOf: id => `/__core-js/${ id }.js`,
  scriptTag: beginning => beginning,
  async serve() { throw new Error('the disk went away'); },
});

await serving({ headers: {}, path: '/__core-js/abc0000000000001.js', url: '/__core-js/abc0000000000001.js' },
  quiet, error => forwarded.push(error));

strictEqual(forwarded.at(-1).message, 'the disk went away', 'adapter #32');
deepStrictEqual(failures, ['adapter:failed', 'adapter:failed'], 'adapter #33');

// the middleware carries the service it runs on: a status endpoint, a second router or a warm-up
// started by hand would otherwise have to build a second service, with a plan and a warm-up of its own
const carrier = polyfillService({ scope: SCOPE });

strictEqual(typeof carrier.service.chooseBundle({ 'user-agent': CHROME }), 'string', 'adapter #28');
strictEqual(carrier.service.urlOf(carrier.service.plan.baseline.bundleId),
  `/__core-js/${ carrier.service.plan.baseline.bundleId }.js`, 'adapter #37');
