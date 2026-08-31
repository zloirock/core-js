import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import {
  canonicalEngine,
  compareVersions,
  nearestNotAbove,
  toTarget,
} from '../../packages/core-js-service/internals/domain/target.js';

// whoever builds the pair, the same browser gives the same one. the four engines browserslist spells
// differently are the ones a hand-written copy of the map loses silently
strictEqual(canonicalEngine('ios_saf'), 'ios', 'target-1 #1');
strictEqual(canonicalEngine('and_chr'), 'chrome-android', 'target-1 #2');
strictEqual(canonicalEngine('and_ff'), 'firefox-android', 'target-1 #3');
strictEqual(canonicalEngine('op_mob'), 'opera-android', 'target-1 #4');
strictEqual(canonicalEngine('oculus'), 'quest', 'target-1 #5');
strictEqual(canonicalEngine('ie_mob'), 'ie', 'target-1 #6');
strictEqual(canonicalEngine('CHROME'), 'chrome', 'target-1 #7');

// an engine the compat data does not track is `null`, not a throw and not a guess
strictEqual(canonicalEngine('wkwebview'), null, 'target-1 #8');
// the keys of a targets declaration that configure the lookup are not engine names either
strictEqual(canonicalEngine('browsers'), null, 'target-1 #9');
strictEqual(canonicalEngine('esmodules'), null, 'target-1 #10');

deepStrictEqual(toTarget('ios_saf', '26.2'), { engine: 'ios', version: '26.2' }, 'target-1 #11');
strictEqual(toTarget('wkwebview', '5'), null, 'target-1 #12');
// `tp` and `latest` are versions the compat parser accepts and we cannot place on a threshold
strictEqual(toTarget('safari', 'tp'), null, 'target-1 #13');

// versions are compared as semver. `parseFloat` orders 26.10 before 26.2, and the bundle a visitor
// gets would then be older than the one they need
deepStrictEqual(['26.10', '26.2', '26.9'].toSorted(compareVersions), ['26.2', '26.9', '26.10'],
  'target-2 #1');
strictEqual(compareVersions('12', '12.0'), 0, 'target-2 #2');
strictEqual(compareVersions('12.0.1', '12'), 1, 'target-2 #3');

// the nearest threshold not above a version, over a SORTED list. the matcher answers a request with
// it and the traffic fold builds the warm-up order with it, so one wrong step here is either the
// wrong bundle or a queue that warms the rare browsers first
const THRESHOLDS = ['11', '12', '12.1', '26.2', '26.10'];

strictEqual(nearestNotAbove(THRESHOLDS, '26.10'), '26.10', 'target-3 #1');
strictEqual(nearestNotAbove(THRESHOLDS, '26.9'), '26.2', 'target-3 #2');
strictEqual(nearestNotAbove(THRESHOLDS, '12.0'), '12', 'target-3 #3');
strictEqual(nearestNotAbove(THRESHOLDS, '999'), '26.10', 'target-3 #4');
// below everything is an answer of its own, not the first entry
strictEqual(nearestNotAbove(THRESHOLDS, '10'), null, 'target-3 #5');
strictEqual(nearestNotAbove([], '12'), null, 'target-3 #6');
// and an empty list answers without reading the version: there is nothing for it to be below, and
// the parse it would go through throws on what it cannot read
strictEqual(nearestNotAbove([], 'tp'), null, 'target-3 #8');
// and it reads the version off whatever the caller keeps in the list
deepStrictEqual(nearestNotAbove([{ v: '11' }, { v: '12' }], '11.5', it => it.v), { v: '11' },
  'target-3 #7');
