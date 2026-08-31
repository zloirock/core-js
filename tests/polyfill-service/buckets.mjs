import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'node:assert/strict';
import buildBuckets from '../../packages/core-js-polyfill-service/internals/domain/buckets.js';

const versions = { coreJS: '4.0.0', compat: '4.0.0' };
const SCOPE = ['es.array.at', 'es.object.group-by'];

const targets = {
  range: null,
  list: [
    { targetKey: 'chrome 80', engine: 'chrome', version: '80', share: 1 },
    { targetKey: 'chrome 110', engine: 'chrome', version: '110', share: 2 },
    // the same module list as chrome 110, from another engine: one bucket, one bundle
    { targetKey: 'edge 110', engine: 'edge', version: '110', share: 4 },
    { targetKey: 'safari 26', engine: 'safari', version: '26', share: 8 },
  ],
};

const lists = {
  'chrome 80': ['es.b', 'es.a'],
  'chrome 110': ['es.a'],
  'edge 110': ['es.a'],
  // a modern engine that needs nothing of the application scope
  'safari 26': [],
};

function listModules(spec) {
  if (spec === null) return ['es.a', 'es.b'];
  const [[engine, version]] = Object.entries(spec);
  return lists[`${ engine } ${ version }`];
}

const plan = buildBuckets({ targets, listModules, versions, minify: true, scope: SCOPE });

// the same module list is the same name, whichever engine asked for it
strictEqual(plan.buckets.length, 3, 'buckets-1 #1');
strictEqual(plan.byEngine.get('chrome').at(-1).bundleId, plan.byEngine.get('edge')[0].bundleId, 'buckets-1 #2');
// and the same set in another order is still the same name - the list is sorted where it is
// hashed, not where it is built
const shuffled = buildBuckets({
  targets, versions, minify: true, scope: SCOPE,
  listModules: spec => [...listModules(spec)].reverse(),
});

strictEqual(shuffled.byEngine.get('chrome')[0].bundleId, plan.byEngine.get('chrome')[0].bundleId, 'buckets-1 #3');

// both projections come out of one pass, so the matcher cannot name a bundle the warm-up never heard
// of
const built = new Set([plan.baseline.bundleId, ...plan.buckets.map(it => it.bundleId)]);

for (const [engine, entries] of plan.byEngine) {
  for (const entry of entries) ok(built.has(entry.bundleId), `buckets-2 #1: ${ engine } ${ entry.version }`);
}

// the traffic of every entry that landed in a bucket is carried by that bucket, for the warm-up
// queue to order by
deepStrictEqual(plan.buckets.map(it => it.share).toSorted(), [1, 6, 8], 'buckets-2 #2');
deepStrictEqual(plan.buckets.find(it => it.share === 6).targets,
  [{ engine: 'chrome', version: '110' }, { engine: 'edge', version: '110' }], 'buckets-2 #3');

// an empty bucket is an ordinary bucket with an empty bundle. ⚠ a branch for "serve no tag at all"
// would run once in a while and drift out of step with the main path unnoticed - in two places
const empty = plan.buckets.find(it => !it.modules.length);

ok(empty && empty.bundleId, 'buckets #1');
strictEqual(plan.byEngine.get('safari')[0].bundleId, empty.bundleId, 'buckets #2');

// the name tells apart everything that tells the bytes apart. ⚠ what is fixed by a constant is left
// out - the day it becomes an option and stays out, one address serves the wrong file for the year
// `immutable` was promised for
const unminified = buildBuckets({ targets, listModules, versions, minify: false, scope: SCOPE });
const olderCoreJS = buildBuckets({ targets, listModules, versions: { ...versions, coreJS: '4.1.0' }, minify: true, scope: SCOPE });
const olderCompat = buildBuckets({ targets, listModules, versions: { ...versions, compat: '4.1.0' }, minify: true, scope: SCOPE });

notStrictEqual(unminified.baseline.bundleId, plan.baseline.bundleId, 'buckets-3 #1');
notStrictEqual(olderCoreJS.baseline.bundleId, plan.baseline.bundleId, 'buckets-3 #2');
// ⚠ the two package versions are hashed separately: compat decides whether the syntax is
// downleveled, and that channel is not covered by the module list
notStrictEqual(olderCompat.baseline.bundleId, plan.baseline.bundleId, 'buckets-3 #3');
notStrictEqual(olderCompat.baseline.bundleId, olderCoreJS.baseline.bundleId, 'buckets-3 #4');

// the baseline is built from the declared range as a whole, not from any single target
deepStrictEqual(plan.baseline.modules, ['es.a', 'es.b'], 'buckets #3');
strictEqual(plan.baseline.targets, null, 'buckets #4');

// ⚠ the generation is the name of the whole PLAN, where a bundle name is the name of one bundle: a
// store keeps or drops a generation whole, and a page holding a bundle of the previous one outlives
// the deploy that replaced it
const other = { ...versions, coreJS: '4.1.0' };

strictEqual(buildBuckets({ targets, listModules, versions, minify: true, scope: [...SCOPE].reverse() }).generation,
  plan.generation, 'buckets-4 #1');
notStrictEqual(buildBuckets({ targets, listModules, versions, minify: true, scope: ['es.array.at'] }).generation,
  plan.generation, 'buckets-4 #2');
notStrictEqual(unminified.generation, plan.generation, 'buckets-4 #3');
notStrictEqual(buildBuckets({ targets, listModules, versions: other, minify: true, scope: SCOPE }).generation,
  plan.generation, 'buckets-4 #4');

// ⚠ and it covers the declared targets as well: the same scope under another declaration is another
// plan, sharing only the buckets that happened to come out the same
const declared = { ...targets, range: { chrome: '80' } };

notStrictEqual(buildBuckets({ targets: declared, listModules, versions, minify: true, scope: SCOPE }).generation,
  plan.generation, 'buckets-4 #5');
// ⚠ and the same declaration written with its keys in another order is the same plan: two spellings
// of one thing must not each get a generation of their own
function ordered(range) {
  return buildBuckets({ targets: { ...targets, range }, listModules, versions, minify: true, scope: SCOPE });
}

strictEqual(ordered({ chrome: '80', edge: '110' }).generation, ordered({ edge: '110', chrome: '80' }).generation,
  'buckets-4 #6');
