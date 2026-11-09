import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import createGetBundle from '../../packages/core-js-service/internals/application/get-bundle.js';
import createServe, { createServeScript, negotiate } from '../../packages/core-js-service/internals/ui/serve.js';

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
// and `identity` is not a given: a store told to keep only compressed forms still has to answer an
// unreadable header with something it holds, rather than name a representation it does not have
strictEqual(negotiate(`${ 'z'.repeat(2000) }, gzip`, ['gzip']), 'gzip', 'serve-2 #6');
strictEqual(negotiate(`${ 'z'.repeat(2000) }, gzip`, ['br', 'gzip']), 'br', 'serve-2 #7');

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

function answer(headers = {}, set = {}) {
  const response = { statusCode: 0, headers: { ...set }, body: undefined };

  response.getHeader = name => response.headers[name];
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

// and it is written from where the middleware is mounted: a router took its own prefix off the
// path before this code saw it, so an address written from the root sends the client to nothing
const behind = answer();

behind.request.baseUrl = '/app';

await serve(behind.request, behind.response, 'cold');
strictEqual(behind.response.headers.location, '/app/__core-js/base.js', 'adapter-5 #5');

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

// `Vary` belongs to the whole stack, not to this route: `cors` puts `Origin` there on every
// response it sees, and overwriting it lets a shared cache hand one origin's answer to another
const shared = answer({ 'accept-encoding': 'gzip' }, { vary: 'Origin' });

await serve(shared.request, shared.response, 'warm');
strictEqual(shared.response.headers.vary, 'origin, accept-encoding', 'serve #28');

// and the field is never said twice, whatever case it was written in
const already = answer({ 'accept-encoding': 'gzip' }, { vary: 'Origin, Accept-Encoding' });

await serve(already.request, already.response, 'warm');
strictEqual(already.response.headers.vary, 'Origin, Accept-Encoding', 'serve #29');

ok(reported.length === 0, 'serve #27');

// the fixed address: one URL for every browser, the bundle chosen when the script is requested
function fixed({
  ready = ['base identity', 'base gzip', 'warm identity', 'warm gzip'],
  chosen = 'warm',
  generation = 'g1',
} = {}) {
  const warnings = [];
  const serveScript = createServeScript({
    getBundle: createGetBundle(plan, { bundles: store(new Set(ready)) }),
    encodings: STORED,
    baselineId: 'base',
    chooseBundle: () => chosen,
    generation,
    warn(condition) { warnings.push(condition); return true; },
  });

  return {
    serveScript,
    reported: warnings,
    choose(bundleId) { chosen = bundleId; },
  };
}

const script = fixed();
const first = answer({ 'accept-encoding': 'gzip', 'user-agent': 'any' });

await script.serveScript(first.request, first.response);
strictEqual(first.response.statusCode, 200, 'serve-4 #1');
strictEqual(first.response.body, BYTES, 'serve-4 #2');
// the bytes behind this address change with the browser, the warm-up and the deploy: the browser may
// keep them, but has to ask before using them again, and no shared cache keeps them at all
strictEqual(first.response.headers['cache-control'], 'private, no-cache', 'serve-4 #3');
strictEqual(first.response.headers.vary, 'user-agent, accept-encoding', 'serve-4 #4');
strictEqual(first.response.headers['content-type'], 'text/javascript; charset=utf-8', 'serve-4 #5');
strictEqual(first.response.headers['x-content-type-options'], 'nosniff', 'serve-4 #6');
strictEqual(first.response.headers['content-encoding'], 'gzip', 'serve-4 #7');
strictEqual(first.response.headers.etag, '"g1-warm-gzip"', 'serve-3 #1');

const again = answer({ 'accept-encoding': 'gzip', 'if-none-match': '"g1-warm-gzip"' });

await script.serveScript(again.request, again.response);
strictEqual(again.response.statusCode, 304, 'serve-3 #2');
strictEqual(again.response.body, undefined, 'serve-3 #3');

// the identifier names the module list, not the targets it was built for: after a deploy the same
// identifier can carry another syntax level, so a tag without the generation would confirm the
// previous deploy's bytes with a 304
const next = fixed({ generation: 'g2' });
const redeployed = answer({ 'accept-encoding': 'gzip', 'if-none-match': '"g1-warm-gzip"' });

await next.serveScript(redeployed.request, redeployed.response);
strictEqual(redeployed.response.statusCode, 200, 'serve-3 #4');
strictEqual(redeployed.response.headers.etag, '"g2-warm-gzip"', 'serve-3 #5');

// a bucket that is not warm yet is the baseline's bytes under this same address, not a redirect:
// the address promises nothing about which bundle it holds
const warming = fixed({ chosen: 'cold' });
const early = answer({ 'accept-encoding': 'gzip' });

await warming.serveScript(early.request, early.response);
strictEqual(early.response.statusCode, 200, 'serve-4 #8');
strictEqual(early.response.body, BYTES, 'serve-4 #9');
strictEqual(early.response.headers.location, undefined, 'serve-4 #10');
strictEqual(early.response.headers.etag, '"g1-base-gzip"', 'serve-3 #6');

// and once the bucket is warm, the baseline's tag no longer matches: the browser gets its own bundle
// on the next page load, with nothing to tell it to
warming.choose('warm');

const warmed = answer({ 'accept-encoding': 'gzip', 'if-none-match': '"g1-base-gzip"' });

await warming.serveScript(warmed.request, warmed.response);
strictEqual(warmed.response.statusCode, 200, 'serve-3 #7');
strictEqual(warmed.response.headers.etag, '"g1-warm-gzip"', 'serve-3 #8');

// no baseline, nothing to send: a failure nobody may cache, rather than a 404 a cache could keep
const missing = fixed({ ready: [], chosen: 'cold' });
const empty = answer({ 'accept-encoding': 'gzip' });

await missing.serveScript(empty.request, empty.response);
strictEqual(empty.response.statusCode, 503, 'serve-4 #11');
strictEqual(empty.response.headers['cache-control'], 'no-store', 'serve-4 #12');
strictEqual(empty.response.body, undefined, 'serve-4 #13');
deepStrictEqual(missing.reported, ['serve:cold-baseline'], 'serve-4 #14');

const declined = answer({ 'accept-encoding': '*;q=0' });

await script.serveScript(declined.request, declined.response);
strictEqual(declined.response.statusCode, 406, 'serve-4 #15');

// both fields are added to what the rest of the stack already varies by
const merged = answer({ 'accept-encoding': 'gzip' }, { vary: 'Origin' });

await script.serveScript(merged.request, merged.response);
strictEqual(merged.response.headers.vary, 'origin, user-agent, accept-encoding', 'serve-4 #16');

ok(script.reported.length === 0, 'serve-4 #17');
