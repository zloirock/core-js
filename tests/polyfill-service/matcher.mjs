import { ok, strictEqual } from 'node:assert/strict';
import compat from '@core-js/compat/compat';
import data from '@core-js/compat/data' with { type: 'json' };
import collectTargets from '../../packages/core-js-polyfill-service/internals/domain/targets.js';
import createMatcher from '../../packages/core-js-polyfill-service/internals/domain/matcher.js';

const plan = {
  baseline: { bundleId: 'baseline' },
  byEngine: new Map([
    ['chrome', [{ version: '80', bundleId: 'chrome-80' }, { version: '110', bundleId: 'chrome-110' }]],
    ['safari', [{ version: '14.1', bundleId: 'safari-14.1' }]],
  ]),
};

const match = createMatcher(plan);

strictEqual(match('chrome 110'), 'chrome-110', 'matcher #1');
// a version between two thresholds is not an approximation: the module list does not move between
// them, so 100 needs exactly what 80 needs
strictEqual(match('chrome 100'), 'chrome-80', 'matcher #2');
// below everything the plan knows, and outside it entirely, the answer is the baseline and
// nothing wider: anything wider is support the project never declared and was never tested on
strictEqual(match('chrome 70'), 'baseline', 'matcher #3');
strictEqual(match('firefox 100'), 'baseline', 'matcher #4');
// "I do not know this browser" is a full answer of the resolver, not a failure
strictEqual(match(null), 'baseline', 'matcher #5');
// the same threshold is spelled `14.1` here and `14.1.2` or `15` by a visitor
strictEqual(match('safari 14.1.2'), 'safari-14.1', 'matcher #6');
strictEqual(match('safari 15'), 'safari-14.1', 'matcher #7');

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
