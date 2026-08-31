import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import createGetBundle from '../../packages/core-js-polyfill-service/internals/application/get-bundle.js';
import createServe, { negotiate } from '../../packages/core-js-polyfill-service/internals/ui/serve.js';

const STORED = ['identity', 'gzip'];
const WITH_BROTLI = ['identity', 'gzip', 'br'];

// the header is parsed in full, not searched for a substring: `gzip` IS in `gzip;q=0`, which is
// the very case the uncompressed copy is kept for
strictEqual(negotiate('gzip;q=0', STORED), 'identity', 'serve #1');
strictEqual(negotiate('gzip, deflate', STORED), 'gzip', 'serve #2');
strictEqual(negotiate('br;q=0.5, gzip;q=0.9', WITH_BROTLI), 'gzip', 'serve #3');
// a tie between the client's q values is broken by our own preference
strictEqual(negotiate('br, gzip', WITH_BROTLI), 'br', 'serve #4');
strictEqual(negotiate('br, gzip', STORED), 'gzip', 'serve #5');
// an absent header means any coding is acceptable, not that the client wants it uncompressed
strictEqual(negotiate(undefined, WITH_BROTLI), 'br', 'serve #6');
// a proxy asking for the uncompressed form is served it, with no branch of its own
strictEqual(negotiate('identity', STORED), 'identity', 'serve #7');
strictEqual(negotiate('*', STORED), 'gzip', 'serve #8');
// everything refused, `identity` included: nothing left to send
strictEqual(negotiate('*;q=0', STORED), null, 'serve #9');
strictEqual(negotiate('gzip;q=0, identity;q=0', STORED), null, 'serve #10');
// the work per request does not grow with what the client wrote. past the bound the header is not
// read at all, and what it might have refused being unknowable, the answer is the one representation
// that is acceptable by default
strictEqual(negotiate(`${ 'z'.repeat(2000) }, gzip`, STORED), 'identity', 'serve-2 #1');
// a header of an ordinary size is still read in full, however many entries it holds
strictEqual(negotiate(`${ Array.from({ length: 40 }, (unused, index) => `x${ index }`).join(', ') }, gzip`,
  STORED), 'gzip', 'serve-2 #2');

const BYTES = Buffer.from('!function () {}();');

function store(has) {
  return {
    // the store answers this for the generation it SERVES; the stub holds one generation, so what it
    // has under any encoding is what it has
    async has(bundleId) {
      return [...has].some(key => key.startsWith(`${ bundleId } `));
    },
    async get(bundleId, encoding) {
      return has.has(`${ bundleId } ${ encoding }`) ? BYTES : null;
    },
  };
}

const plan = {
  baseline: { bundleId: 'base' },
  buckets: [{ bundleId: 'warm' }, { bundleId: 'cold' }],
};

function handler({ ready = ['base identity', 'base gzip', 'warm identity', 'warm gzip'] } = {}) {
  const reported = [];
  const serve = createServe({
    getBundle: createGetBundle(plan, { bundles: store(new Set(ready)) }),
    encodings: STORED,
    baselineId: 'base',
    urlOf: bundleId => `/__core-js/${ bundleId }.js`,
    warn(condition) { reported.push(condition); return true; },
  });

  return { serve, reported };
}

function answer(headers = {}) {
  const response = { statusCode: 0, headers: {}, body: undefined };

  response.setHeader = (name, value) => { response.headers[name] = value; };
  response.end = body => { response.body = body; };

  return { request: { headers }, response };
}

const { serve, reported } = handler();

const ok200 = answer({ 'accept-encoding': 'gzip' });

await serve(ok200.request, ok200.response, 'warm');

strictEqual(ok200.response.statusCode, 200, 'serve #11');
strictEqual(ok200.response.body, BYTES, 'serve #12');
// the address is promised for a year, which is what the identifier has to be worth
strictEqual(ok200.response.headers['cache-control'], 'public, max-age=31536000, immutable', 'serve-1 #1');
strictEqual(ok200.response.headers['content-type'], 'text/javascript; charset=utf-8', 'serve #13');
strictEqual(ok200.response.headers['x-content-type-options'], 'nosniff', 'serve #14');
// always: at least two encodings are stored, so the answer depends on the header by construction
strictEqual(ok200.response.headers.vary, 'accept-encoding', 'serve #15');
strictEqual(ok200.response.headers['content-encoding'], 'gzip', 'serve #16');
strictEqual(ok200.response.headers['content-length'], BYTES.length, 'serve #17');
// the encoding is part of the tag: the gzip copy and the uncompressed one are different bytes
strictEqual(ok200.response.headers.etag, '"warm-gzip"', 'serve #18');

const raw = answer({ 'accept-encoding': 'gzip;q=0' });

await serve(raw.request, raw.response, 'warm');
strictEqual(raw.response.headers.etag, '"warm-identity"', 'serve #19');
strictEqual(raw.response.headers['content-encoding'], undefined, 'serve #20');

const revalidated = answer({ 'accept-encoding': 'gzip', 'if-none-match': '"warm-gzip"' });

await serve(revalidated.request, revalidated.response, 'warm');
strictEqual(revalidated.response.statusCode, 304, 'serve #21');
strictEqual(revalidated.response.body, undefined, 'serve #22');

// the tag of another representation is not this one
const stale = answer({ 'accept-encoding': 'gzip', 'if-none-match': '"warm-identity"' });

await serve(stale.request, stale.response, 'warm');
strictEqual(stale.response.statusCode, 200, 'serve #23');

// the same bound on the other header a client writes. past the bound none of it is read, which
// costs one full response and never a wrong one
const flood = answer({
  'accept-encoding': 'gzip',
  'if-none-match': `${ Array.from({ length: 500 }, () => '"warm-gzip"').join(',') }`,
});

await serve(flood.request, flood.response, 'warm');
strictEqual(flood.response.statusCode, 200, 'serve-2 #3');
// and the same validator inside the bound still revalidates
const short = answer({ 'accept-encoding': 'gzip', 'if-none-match': '"other", "warm-gzip"' });

await serve(short.request, short.response, 'warm');
strictEqual(short.response.statusCode, 304, 'serve-2 #4');

// an unknown identifier is a 404 and nothing else - no building, no searching
const unknown = answer();

await serve(unknown.request, unknown.response, 'whatever-was-sent');
strictEqual(unknown.response.statusCode, 404, 'serve-2 #5');

// unknown means the STORE does not have it, not that this plan does not name it: a page from the
// deploy before this one is already in a browser and its tag is parser-blocking, so a bundle still
// on disk is served whoever planned it. how long that lasts is `retain`, not this branch
const previous = handler({ ready: ['left-behind gzip'] });
const outlived = answer();

await previous.serve(outlived.request, outlived.response, 'left-behind');
strictEqual(outlived.response.statusCode, 200, 'get-bundle-1 #6');
strictEqual(outlived.response.headers.etag, '"left-behind-gzip"', 'get-bundle-1 #7');

// and the same identifier held by an OLDER generation does not count as warm: the name covers the
// module list, never the targets it was built for, so those bytes carry the previous plan's syntax
// level. the visitor this plan routed here goes to the baseline until our own copy exists
const retained = {
  serve: createServe({
    getBundle: createGetBundle(plan, {
      bundles: {
        // held on disk from a retained generation, but not in the one being served
        async has() { return false; },
        async get() { return BYTES; },
      },
    }),
    encodings: STORED,
    baselineId: 'base',
    urlOf: bundleId => `/__core-js/${ bundleId }.js`,
    warn() { return true; },
  }),
};
const outdated = answer();

await retained.serve(outdated.request, outdated.response, 'warm');
strictEqual(outdated.response.statusCode, 302, 'get-bundle-1 #8');
strictEqual(outdated.response.headers.location, '/__core-js/base.js', 'get-bundle-1 #9');

// and the rule stops at the plan: an identifier this plan does NOT name has no reader of ours to
// mislead, and the page holding it is already in a browser - it is served from the retained
// generation, which is the whole point of keeping one
const inherited = answer();

await retained.serve(inherited.request, inherited.response, 'left-behind');
strictEqual(inherited.response.statusCode, 200, 'get-bundle-1 #10');

// a bucket that is planned but not warm yet is a REDIRECT to the baseline, never the baseline's
// bytes under this identifier. this address is `immutable` for a year: a client given the wrong
// bundle here keeps it for a year, and the warm-up finishing changes nothing for them
const cold = answer();

await serve(cold.request, cold.response, 'cold');
strictEqual(cold.response.statusCode, 302, 'get-bundle-1 #1');
strictEqual(cold.response.headers.location, '/__core-js/base.js', 'get-bundle-1 #2');
strictEqual(cold.response.headers['cache-control'], 'no-store', 'get-bundle-1 #3');
strictEqual(cold.response.body, undefined, 'get-bundle-1 #4');
strictEqual(cold.response.headers.etag, undefined, 'get-bundle-1 #5');

// and the baseline itself is never redirected to itself: requests wait for it, so it cannot be
// cold - but a redirect loop is not the way to find out that it is
const broken = handler({ ready: [] });
const loop = answer();

await broken.serve(loop.request, loop.response, 'base');
strictEqual(loop.response.statusCode, 404, 'serve #24');
deepStrictEqual(broken.reported, ['serve:cold-baseline'], 'serve #25');

const refused = answer({ 'accept-encoding': '*;q=0' });

await serve(refused.request, refused.response, 'warm');
strictEqual(refused.response.statusCode, 406, 'serve #26');

ok(reported.length === 0, 'serve #27');
