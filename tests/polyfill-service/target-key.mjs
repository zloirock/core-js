import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import {
  canonicalEngine,
  compareVersions,
  parseTargetKey,
  toTargetKey,
} from '../../packages/core-js-polyfill-service/internals/domain/target-key.js';

// whoever builds the key, the same browser gives the same one. the four engines browserslist spells
// differently are the ones a hand-written copy of the map loses silently
strictEqual(canonicalEngine('ios_saf'), 'ios', 'target-key-1 #1');
strictEqual(canonicalEngine('and_chr'), 'chrome-android', 'target-key-1 #2');
strictEqual(canonicalEngine('and_ff'), 'firefox-android', 'target-key-1 #3');
strictEqual(canonicalEngine('op_mob'), 'opera-android', 'target-key-1 #4');
strictEqual(canonicalEngine('oculus'), 'quest', 'target-key-1 #5');
strictEqual(canonicalEngine('ie_mob'), 'ie', 'target-key-1 #6');
strictEqual(canonicalEngine('CHROME'), 'chrome', 'target-key-1 #7');

// an engine the compat data does not track is `null`, not a throw and not a guess
strictEqual(canonicalEngine('wkwebview'), null, 'target-key-1 #8');
// the keys of a targets declaration that configure the lookup are not engine names either
strictEqual(canonicalEngine('browsers'), null, 'target-key-1 #9');
strictEqual(canonicalEngine('esmodules'), null, 'target-key-1 #10');

strictEqual(toTargetKey('ios_saf', '26.2'), 'ios 26.2', 'target-key-1 #11');
strictEqual(toTargetKey('wkwebview', '5'), null, 'target-key-1 #12');
// `tp` and `latest` are versions the compat parser accepts and we cannot place on a threshold
strictEqual(toTargetKey('safari', 'tp'), null, 'target-key-1 #13');
deepStrictEqual(parseTargetKey('chrome-android 143'), { engine: 'chrome-android', version: '143' },
  'target-key-1 #14');

// versions are compared as semver. `parseFloat` orders 26.10 before 26.2, and the bundle a visitor
// gets would then be older than the one they need
deepStrictEqual(['26.10', '26.2', '26.9'].toSorted(compareVersions), ['26.2', '26.9', '26.10'],
  'target-key-2 #1');
strictEqual(compareVersions('12', '12.0'), 0, 'target-key-2 #2');
strictEqual(compareVersions('12.0.1', '12'), 1, 'target-key-2 #3');
