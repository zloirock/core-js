import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import collectTargets from '../../packages/core-js-polyfill-service/internals/domain/targets.js';

// a fixture instead of the real compat data on purpose: how many thresholds thirteen engines have
// is somebody else's commit away from changing, and an assertion on it would go red for a reason
// that has nothing to do with this package
const data = {
  'es.a': { chrome: '80', safari: '14.1', node: '16' },
  'es.b': { chrome: '95', safari: '15.4' },
  'es.c': { chrome: '110' },
};

function collect(options) {
  const warned = [];
  const result = collectTargets({ data, warn: (condition, message) => warned.push([condition, message]), ...options });
  return { ...result, warned };
}

const all = collect({});

// no declaration: the lower bound is the floor of core-js itself, so every threshold is an entry
deepStrictEqual(all.list.map(it => it.targetKey), [
  'chrome 80', 'chrome 95', 'chrome 110', 'safari 14.1', 'safari 15.4',
], 'targets #1');
// node is in the fixture data and must not be in the plan: it never asks us for a page
strictEqual(all.range, null, 'targets #2');

// an engine of the declaration does not disappear without a word. one key dropped out of several
// sends its visitors to the baseline; every key dropped leaves an empty declaration, which compat
// reads as "everything"
const declared = collect({ declaration: { chrome: '90', wkwebview: '5', node: '20' } });

deepStrictEqual(declared.list.map(it => it.targetKey), ['chrome 90', 'chrome 95', 'chrome 110'], 'targets-1 #1');
deepStrictEqual(declared.warned.map(([condition]) => condition),
  ['targets:unknown:wkwebview', 'targets:server:node'], 'targets-1 #2');
// the declared bound itself is an entry, and the thresholds below it are gone: a visitor at the
// bound needs what the bound needs
strictEqual(declared.list[0].version, '90', 'targets-1 #3');

// the same failure seen whole: the dropped keys are reported one by one, but a declaration from
// which NOTHING survived reports as nothing at all - the plan comes out empty and the service
// quietly stops doing the one thing it is for
const nothing = collect({ declaration: { wkwebview: '5' } });

deepStrictEqual(nothing.list, [], 'targets-1 #4');
deepStrictEqual(nothing.warned.map(([condition]) => condition),
  ['targets:unknown:wkwebview', 'targets:empty'], 'targets-1 #5');
deepStrictEqual(collect({ declaration: {} }).warned.map(([condition]) => condition), ['targets:empty'],
  'targets-1 #6');
// and neither an absent declaration nor one that does name an engine says a word
deepStrictEqual(all.warned, [], 'targets-1 #7');
deepStrictEqual(declared.warned.map(([condition]) => condition),
  ['targets:unknown:wkwebview', 'targets:server:node'], 'targets-1 #8');

// shares are folded onto the entries by the same nearest-lower rule the matcher uses, so that the
// warm-up order matches real traffic. taken per threshold instead, most of them read zero
const shares = collect({
  shares: engine => engine === 'chrome' ? [['80', 1], ['94', 2], ['95', 4], ['120', 8], ['79', 16]] : [],
});

deepStrictEqual(shares.list.filter(it => it.engine === 'chrome').map(it => [it.version, it.share]),
  [['80', 3], ['95', 4], ['110', 8]], 'targets #3');
