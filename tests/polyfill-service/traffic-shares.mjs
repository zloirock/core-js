import { ok, strictEqual } from 'node:assert/strict';
import trafficShares from '../../packages/core-js-polyfill-service/internals/infrastructure/traffic-shares.js';

// no assertion on the figures themselves: they move with every release of `caniuse-lite`, and what
// they decide is the ORDER the buckets are warmed in, never which bundle a visitor gets
for (const engine of ['chrome', 'firefox', 'safari', 'edge', 'samsung']) {
  const entries = trafficShares(engine);
  ok(entries.length, `traffic-shares #1: ${ engine } carries no traffic at all`);
  for (const [version, share] of entries) {
    ok(/^\d/.test(version), `traffic-shares #2: ${ engine } ${ version } is not a version`);
    ok(share > 0, `traffic-shares #3: ${ engine } ${ version } has no share`);
  }
}

// the four engines browserslist spells differently are exactly the ones a hand-written alias map
// loses: nothing throws, the mobile buckets simply come out with no traffic and get warmed last
for (const engine of ['chrome-android', 'firefox-android', 'opera-android', 'ios']) {
  ok(trafficShares(engine).length, `traffic-shares #4: ${ engine } carries no traffic at all`);
}

// the same failure, seen whole: mobile is more than half of the traffic, so a broken mapping does
// not empty the list, it halves the coverage. a wide bound, because the figure itself moves
const VISITOR_ENGINES = ['android', 'chrome', 'chrome-android', 'edge', 'firefox', 'firefox-android',
  'ie', 'ios', 'opera', 'opera-android', 'quest', 'safari', 'samsung'];

const covered = VISITOR_ENGINES.reduce((total, engine) => trafficShares(engine)
  .reduce((sum, [, share]) => sum + share, total), 0);

ok(covered > 90, `traffic-shares #5: only ${ covered.toFixed(1) }% of world traffic is accounted for`);

// the headset is not among the agents `caniuse-lite` tracks: its buckets carry no traffic and are
// warmed last of all. an empty list is an answer, not a failure
strictEqual(trafficShares('quest').length, 0, 'traffic-shares #6');
strictEqual(trafficShares('rhino').length, 0, 'traffic-shares #7');
strictEqual(trafficShares('node').length, 0, 'traffic-shares #8');
