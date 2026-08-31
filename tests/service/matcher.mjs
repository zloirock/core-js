import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import compat from '@core-js/compat/compat';
import data from '@core-js/compat/data' with { type: 'json' };
import collectTargets from '../../packages/core-js-service/internals/domain/targets.js';
import buildBuckets from '../../packages/core-js-service/internals/domain/buckets.js';
import createMatcher from '../../packages/core-js-service/internals/domain/matcher.js';

// the shape `buildBuckets` produces: the thresholds per engine, and what each bundle carries -
// which is what tells whether one bundle can stand in for another
const plan = {
  baseline: { bundleId: 'baseline', modules: ['a', 'b', 'c', 'd'] },
  byEngine: new Map([
    ['chrome', [{ version: '80', bundleId: 'chrome-80' }, { version: '110', bundleId: 'chrome-110' }]],
    ['safari', [{ version: '14.1', bundleId: 'safari-14.1' }]],
    ['opera', [{ version: '60', bundleId: 'opera-60' }, { version: '70', bundleId: 'opera-70' }]],
  ]),
  buckets: [
    { bundleId: 'chrome-80', modules: ['a', 'b', 'c'] },
    { bundleId: 'chrome-110', modules: ['a'] },
    { bundleId: 'safari-14.1', modules: ['a', 'b'] },
    { bundleId: 'opera-60', modules: ['a', 'b'] },
    { bundleId: 'opera-70', modules: ['c'] },
  ],
};

const matcher = createMatcher(plan);
// the pair the resolver hands over, which is what the matcher is given
function match(engine, version) {
  return matcher({ engine, version });
}

strictEqual(match('chrome', '110'), 'chrome-110', 'matcher #1');
// a version between two thresholds is not an approximation: the module list does not move between
// them, so 100 needs exactly what 80 needs
strictEqual(match('chrome', '100'), 'chrome-80', 'matcher #2');
// below everything the plan knows, and outside it entirely, the answer is the baseline and
// nothing wider: anything wider is support the project never declared and was never tested on
strictEqual(match('chrome', '70'), 'baseline', 'matcher #3');
strictEqual(match('firefox', '100'), 'baseline', 'matcher #4');
// "I do not know this browser" is a full answer of the resolver, not a failure
strictEqual(matcher(null), 'baseline', 'matcher #5');
// the same threshold is spelled `14.1` here and `14.1.2` or `15` by a visitor
strictEqual(match('safari', '14.1.2'), 'safari-14.1', 'matcher #6');
strictEqual(match('safari', '15'), 'safari-14.1', 'matcher #7');

// the matcher indexes the plan, it does not rewrite it: the parsed thresholds are its own, and the
// plan keeps the versions as the compat data spells them - `90` there is not `90.0.0`
deepStrictEqual(plan.byEngine.get('chrome').map(it => it.version), ['80', '110'], 'matcher #8');

// a named Chromium browser arrives as two candidates: its own row, and the Chromium it runs on. the
// answer is the bundle that covers BOTH - the derivative rows say where a build lags its base, and
// the base says what it cannot have less than
strictEqual(matcher({ engine: 'opera', version: '60', alternate: { engine: 'chrome', version: '110' } }),
  'opera-60', 'matcher-2 #1');
// the row claims a Chromium newer than the one the string says it runs: the base wins, and this is
// the whole point - a fork that lags its version number would otherwise be served short
strictEqual(matcher({ engine: 'opera', version: '70', alternate: { engine: 'chrome', version: '80' } }),
  'chrome-80', 'matcher-2 #2');
// neither covers the other and the plan holds no union of them: the baseline covers everything
strictEqual(matcher({ engine: 'opera', version: '70', alternate: { engine: 'chrome', version: '110' } }),
  'baseline', 'matcher-2 #3');
// and one candidate is still one answer
strictEqual(matcher({ engine: 'opera', version: '70' }), 'opera-70', 'matcher-2 #4');

// the nearest threshold below always needs a SUPERSET of what the visitor needs. this is the one
// place where a miss costs a broken page instead of a few kilobytes, and it stands on the shape of
// the compat data, not on our code - so it is checked against the real data
const targets = collectTargets({ data, warn: () => true });
const byEngine = new Map();

for (const { engine, version } of targets.list) {
  let versions = byEngine.get(engine);
  if (!versions) byEngine.set(engine, versions = []);
  versions.push(version);
}

let pairs = 0;

for (const [engine, versions] of byEngine) {
  let lower = null;

  for (const version of versions) {
    const modules = new Set(compat({ targets: { [engine]: version } }).list);
    if (lower !== null) {
      pairs++;
      const gained = [...modules].filter(name => !lower.has(name));
      ok(!gained.length, `matcher-1 #1: ${ engine } ${ version } needs ${ gained.join(', ') }, `
        + 'which the threshold below it does not');
    }
    lower = modules;
  }
}

// the check is worth nothing if the data stops being enumerated
ok(pairs > 500, `matcher-1 #2: only ${ pairs } pairs of adjacent thresholds were compared`);

// and the same promise through the WHOLE pipeline rather than over the data alone: a real plan, and
// every version of every engine it names - the ones the data mentions, and the gaps between them,
// where a visitor is far likelier to be than on a threshold exactly. What is asserted is a relation
// and not a count, so a data update moves the numbers and never the verdict
const scope = compat({ modules: [/^es\./], targets: { ignoreBrowserslistConfig: true } }).list.slice(0, 120);
const wholeData = buildBuckets({
  targets,
  listModules: declared => compat({ modules: scope, targets: declared ?? { ignoreBrowserslistConfig: true } }).list,
  versions: { coreJS: '4.0', compat: '4.0', builder: '4.0' },
  minify: true,
  scope,
});
const served = createMatcher(wholeData);
const carried = new Map(wholeData.buckets.map(bucket => [bucket.bundleId, new Set(bucket.modules)]));

carried.set(wholeData.baseline.bundleId, new Set(wholeData.baseline.modules));

const asked = new Map();

for (const row of Object.values(data)) {
  for (const [engine, version] of Object.entries(row)) {
    if (!wholeData.byEngine.has(engine) || typeof version != 'string') continue;
    if (!asked.has(engine)) asked.set(engine, new Set());
    const [major, minor = '0'] = version.split('.', 2);
    // the threshold, one step above it, and a major above that
    asked.get(engine).add(version).add(`${ major }.${ Number(minor) + 1 }`).add(`${ Number(major) + 1 }.0`);
  }
}

let visitors = 0;

for (const [engine, versions] of asked) {
  for (const version of versions) {
    visitors++;
    const bundle = carried.get(served({ engine, version }));
    const short = compat({ modules: scope, targets: { [engine]: version } }).list.filter(module => !bundle.has(module));

    ok(!short.length, `matcher-1 #3: ${ engine } ${ version } is served a bundle without ${ short.slice(0, 3).join(', ') }`);
  }
}

ok(visitors > 1000, `matcher-1 #4: only ${ visitors } engine versions were put through the plan`);
