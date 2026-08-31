import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert/strict';
import { availableParallelism } from 'node:os';
import createWarm, { CONCURRENCY, concurrencyFor } from '../../packages/core-js-service/internals/application/warm.js';

const plan = {
  baseline: { bundleId: 'baseline', modules: ['es.a', 'es.b'], targets: null },
  byEngine: new Map(),
  buckets: [
    { bundleId: 'rare', modules: ['es.a'], targets: { ie: '11' }, share: 0.5 },
    { bundleId: 'busy', modules: [], targets: { chrome: '143' }, share: 80 },
    { bundleId: 'middling', modules: ['es.b'], targets: { safari: '15' }, share: 12 },
    // the same bundle two buckets over: one build, not two
    { bundleId: 'busy', modules: [], targets: { edge: '143' }, share: 3 },
  ],
};

function fake({ fails = [], concurrency = 1 } = {}) {
  const store = new Map();
  const order = [];
  const reported = [];
  let inFlight = 0;
  let peak = 0;

  const warm = createWarm(plan, {
    ...concurrency === null ? null : { concurrency },
    warn(condition, message) { reported.push([condition, message]); return true; },
    bundles: {
      async has(bundleId) { return store.has(bundleId); },
      async put(bundleId, bundle) { store.set(bundleId, bundle); },
    },
    async build({ modules, targets }) {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await Promise.resolve();
      inFlight--;
      order.push(JSON.stringify(targets));
      if (fails.includes(JSON.stringify(targets))) throw new Error('rolldown said no');
      return `built ${ modules.join(',') }`;
    },
  });

  return { warm, store, order, reported, peak: () => peak };
}

// the baseline is built first and on its own - requests wait for it, and for nothing else. a
// failure here is a startup failure: the baseline is what every unrecognized visitor gets, and what
// every miss falls back to
const first = fake();

strictEqual(await first.warm.baseline(), true, 'warm-1 #1');
deepStrictEqual(first.order, ['null'], 'warm-1 #2');
deepStrictEqual(first.store.get('baseline'), { modules: ['es.a', 'es.b'], script: 'built es.a,es.b' },
  'warm-1 #3');
await rejects(fake({ fails: ['null'] }).warm.baseline(), /rolldown said no/, 'warm-1 #4');

// then by descending share of traffic, and the order matters: most of it sits in a handful of
// buckets
const queued = fake();

await queued.warm.baseline();

const { built, failed } = await queued.warm.buckets();

deepStrictEqual(queued.order, ['null', '{"chrome":"143"}', '{"safari":"15"}', '{"ie":"11"}'], 'warm #1');
// the identifier is the hash of the input, so the second bucket naming the same bundle is already
// there and is not built again. that is what makes locks unnecessary
deepStrictEqual(built, ['busy', 'middling', 'rare'], 'warm-2 #1');
deepStrictEqual(failed, [], 'warm #2');

// one bucket failing does not stop the warm-up: the baseline is there, so those visitors get
// extra weight and a working page. reported per bundle, so a systematic failure is not hidden
// behind the first one
const broken = fake({ fails: ['{"safari":"15"}', '{"ie":"11"}'] });

await broken.warm.baseline();

const outcome = await broken.warm.buckets();

deepStrictEqual(outcome.built, ['busy'], 'warm #3');
deepStrictEqual(outcome.failed.toSorted(), ['middling', 'rare'], 'warm #4');
deepStrictEqual(broken.reported.map(([condition]) => condition),
  ['warm:failed:middling', 'warm:failed:rare'], 'warm #5');
ok(broken.reported.every(([, message]) => message.includes('rolldown said no')), 'warm #6');

// as many at a time as it was told, and no more
const parallel = fake({ concurrency: 4 });

await parallel.warm.baseline();
await parallel.warm.buckets();
ok(parallel.peak() > 1, 'warm #7');
ok(parallel.peak() <= 4, 'warm #8');

// and told nothing, it takes the machine's own number - half of what the process may use, never
// zero, whatever machine that is. a zero would build nothing and report nothing: `Promise.all` over
// no workers resolves at once, and the warm-up would call the plan done with the store empty
strictEqual(concurrencyFor(1), 1, 'warm-3 #1');
strictEqual(concurrencyFor(2), 1, 'warm-3 #2');
strictEqual(concurrencyFor(8), 4, 'warm-3 #3');
strictEqual(concurrencyFor(64), 32, 'warm-3 #4');
ok(CONCURRENCY >= 1 && CONCURRENCY <= availableParallelism(), 'warm-3 #5');

const byDefault = fake({ concurrency: null });

await byDefault.warm.baseline();

const drained = await byDefault.warm.buckets();

// as a set: the fixture names one bundle from two buckets, which a real plan cannot do - it keys
// them by that very identifier - and with workers in flight neither sees the other's `put` in time
deepStrictEqual([...new Set(drained.built)].toSorted(), ['busy', 'middling', 'rare'], 'warm-3 #6');
ok(byDefault.peak() <= CONCURRENCY, 'warm-3 #7');
