import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, rm, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import createService from '@core-js/polyfill-service';
import buildPlan from '../../packages/core-js-polyfill-service/internals/application/build-plan.js';
import createMatcher from '../../packages/core-js-polyfill-service/internals/domain/matcher.js';
import createResolver from '../../packages/core-js-polyfill-service/internals/domain/resolver.js';
import parseUserAgent from '../../packages/core-js-polyfill-service/internals/infrastructure/ua-bowser.js';

const data = {
  'es.a': { chrome: '80', safari: '15.4' },
  'es.b': { chrome: '95' },
};

const versions = { coreJS: '4.0.0', compat: '4.0.0' };

function noop() { /* the warnings of a well-formed configuration are not what this suite is about */ }

function plan(targets) {
  return buildPlan({ targets, versions, minify: true, scope: [] }, {
    data,
    trafficShares: () => [],
    listModules: spec => spec === null ? ['es.a', 'es.b'] : [`for ${ JSON.stringify(spec) }`],
    warn: () => true,
  });
}

// the declaration reaches the thresholds: an engine outside it has no entries at all, and its
// visitors fall through to the baseline
const declared = plan({ chrome: '90' });

deepStrictEqual(declared.byEngine.keys().toArray(), ['chrome'], 'build-plan #1');
deepStrictEqual(declared.byEngine.get('chrome').map(it => it.version), ['90', '95'], 'build-plan #2');
deepStrictEqual(plan(null).byEngine.keys().toArray(), ['chrome', 'safari'], 'build-plan #3');

// the baseline comes from the range as a whole, never from one of the thresholds
deepStrictEqual(plan(null).baseline.modules, ['es.a', 'es.b'], 'build-plan #4');

// and now the same thing over the real data: a small scope, thirteen engines, no fixtures
const scope = ['es.array.at', 'es.object.group-by', 'es.string.replace-all', 'es.iterator.map'];
const kept = await mkdtemp(join(tmpdir(), 'core-js-polyfill-service-plan-'));
const service = createService({ scope, directory: kept, warn: noop });

ok(service.plan.buckets.length > 1, 'build-plan #5');
ok(service.plan.baseline.modules.length >= service.plan.buckets[0].modules.length, 'build-plan #6');

// what the matcher can name, the warm-up will have built. ⚠ two passes over the data could drift,
// and a name the warm-up never heard of means a build on the request path
const built = new Set([service.plan.baseline.bundleId, ...service.plan.buckets.map(it => it.bundleId)]);

for (const [engine, entries] of service.plan.byEngine) {
  for (const entry of entries) ok(built.has(entry.bundleId), `build-plan #7: ${ engine } ${ entry.version }`);
}

// the whole chain a request goes through, over the real plan: headers to a name that exists
const match = createMatcher(service.plan);
const resolve = createResolver({ parseUserAgent });

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/143.0.0.0 Safari/537.36';
const IE = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';

ok(built.has(match(resolve({ 'user-agent': CHROME }))), 'build-plan #8');
ok(built.has(match(resolve({ 'user-agent': IE }))), 'build-plan #9');
// the two ends of the floor do not share a bundle: a current Chrome needs less than IE 11
ok(match(resolve({ 'user-agent': CHROME })) !== match(resolve({ 'user-agent': IE })), 'build-plan #10');
// an unrecognized visitor gets the baseline, which is what the project would have shipped anyway
strictEqual(match(resolve({ 'user-agent': 'x' })), service.plan.baseline.bundleId, 'build-plan #11');

// and the whole of it once more with the bundles actually built: the identifier a request resolves
// to is one the warm-up has put bytes behind
const { ready, warmed } = service.start();

await ready;
ok(Buffer.isBuffer(await service.bundles.get(service.plan.baseline.bundleId, 'identity')), 'build-plan #12');

const { failed } = await warmed;

deepStrictEqual(failed, [], 'build-plan #13');

for (const bucket of service.plan.buckets) {
  ok(await service.bundles.has(bucket.bundleId), `build-plan #14: ${ JSON.stringify(bucket.targets) }`);
}

const forChrome = await service.bundles.get(match(resolve({ 'user-agent': CHROME })), 'identity');
const forIE = await service.bundles.get(match(resolve({ 'user-agent': IE })), 'identity');

ok(forIE.length > forChrome.length, 'build-plan #15');
// starting twice is starting once: the middleware may be installed on more than one router
strictEqual(service.start().ready, ready, 'build-plan #16');

// ⚠ the generations left behind are pruned once the new one is warm, and never before it: a prune
// that ran first would take the only bundles anything could be served from if this build failed. one
// stays - the page of the deploy just replaced is in a browser already
deepStrictEqual((await readdir(kept)).toSorted(),
  [service.plan.generation, '0123456789abcdef'].toSorted(), 'build-plan #19');

try {
  await rm(kept, { force: true, recursive: true });
} catch (error) {
  // a leftover temporary directory cannot break a run; a failure to remove it must not speak for
  // the assertions above
  console.warn(`could not remove ${ kept }: ${ error.message }`);
}
