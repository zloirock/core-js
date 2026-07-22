// Deterministic, headless RxJS exercise for the e2e-libs suite.
//
// `run()` returns a Promise of { checks } - a list of { label, actual, expected, pass } where each
// entry computed its own `pass` via a JSON deep-equal, so consumers (HTML harness, node pre-flight)
// only render `pass` and never need their own comparator.
//
// The surface is broad on purpose (creation / transform / filter / combine / subjects / errors /
// aggregate / promise-interop / virtual-time) to maximize the ECMAScript stdlib that core-js must
// inject for the ie:11 target: Promise, Symbol.iterator/observable, internal Map/Set, Array.from,
// plus the iterator-protocol usage that Babel's spread/for-of helpers introduce.
//
// No `async`/generator syntax here (only Promise.then chains) so the ES5 down-compile needs no
// regenerator runtime.
import {
  of, from, range, merge, concat, zip, combineLatest, forkJoin, throwError,
  BehaviorSubject, ReplaySubject, firstValueFrom, lastValueFrom,
  map, filter, reduce, scan, toArray, mergeMap, switchMap, concatMap,
  groupBy, bufferCount, pairwise, distinctUntilChanged, catchError,
  debounceTime, throttleTime,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function collect(obs) {
  return firstValueFrom(obs.pipe(toArray()));
}

export function run() {
  const checks = [];
  function check(label, actual, expected) {
    checks.push({ label, actual, expected, pass: eq(actual, expected) });
  }

  // --- synchronous subjects (no promises) ---
  const bs = new BehaviorSubject(0);
  const bsSeen = [];
  bs.subscribe(v => bsSeen.push(v));
  bs.next(1);
  bs.next(2);
  check('BehaviorSubject', bsSeen, [0, 1, 2]);

  const rs = new ReplaySubject(2);
  rs.next(1);
  rs.next(2);
  rs.next(3);
  const rsSeen = [];
  rs.subscribe(v => rsSeen.push(v));
  rs.complete();
  check('ReplaySubject_2', rsSeen, [2, 3]);

  // --- virtual-time (value-level, timing-agnostic) ---
  const debounced = [];
  new TestScheduler(() => { /* marble comparator unused: value-level checks below */ }).run(({ cold }) => {
    cold('a-b-c-d|', { a: 1, b: 2, c: 3, d: 4 }).pipe(debounceTime(10)).subscribe(v => debounced.push(v));
  });
  check('debounceTime_keepsLast', debounced, [4]);

  const throttled = [];
  new TestScheduler(() => { /* marble comparator unused: value-level checks below */ }).run(({ cold }) => {
    cold('a-b-c-d|', { a: 1, b: 2, c: 3, d: 4 }).pipe(throttleTime(10)).subscribe(v => throttled.push(v));
  });
  check('throttleTime_keepsFirst', throttled, [1]);

  // --- iterator-protocol syntax: for-of / spread over a non-array iterable. Babel down-compiles
  // these to _createForOfIteratorHelper / _toConsumableArray, which reach for Symbol.iterator.
  // NOTE this does NOT currently distinguish unplugin's phases: measured with Babel in the pipeline,
  // `pre` and `post` inject the identical set for rxjs, because the source's own `new Set(...)`
  // already pulls es.symbol.iterator in. What is unasserted is the injection SET at post (the
  // snapshot runs without Babel, at the default phase); artifacts does build and pre-flight at
  // post — see README.
  const forOfSeen = [];
  const forOfInput = [3, 1, 3, 2, 1]; // via a var: the Set dedups at runtime, without a literal-dup lint flag
  for (const v of new Set(forOfInput)) forOfSeen.push(v);
  check('for_of_set', forOfSeen, [3, 1, 2]);
  const spreadInput = [1, 2, 2, 3];
  check('spread_set', [...new Set(spreadInput)], [1, 2, 3]);

  // --- async operator pipelines ---
  return Promise.all([
    firstValueFrom(of(1, 2, 3, 4, 5).pipe(reduce((a, b) => a + b, 0))),
    collect(of(1, 2, 3).pipe(scan((a, b) => a + b, 0))),
    collect(range(1, 5).pipe(filter(x => x % 2 === 0))),
    collect(merge(of(1), of(2), of(3))),
    collect(concat(of(1, 2), of(3, 4))),
    collect(zip(of(1, 2, 3), of('a', 'b', 'c')).pipe(map(([n, s]) => `${ n }${ s }`))),
    collect(combineLatest([of(1), of(2)])),
    collect(forkJoin([of(1, 2), of(3, 4)])),
    collect(of(1, 2).pipe(mergeMap(x => of(x, x * 10)))),
    collect(of(1, 2, 3).pipe(switchMap(x => of(x * 10)))),
    collect(of(1, 2).pipe(concatMap(x => of(x, x)))),
    collect(of(1, 2, 3, 4, 5, 6).pipe(groupBy(x => x % 2), mergeMap(g => g.pipe(toArray())))),
    collect(range(1, 6).pipe(bufferCount(2))),
    collect(of(1, 2, 3).pipe(pairwise())),
    collect(of(1, 1, 2, 2, 3, 1).pipe(distinctUntilChanged())),
    collect(throwError(() => new Error('boom')).pipe(catchError(() => of('recovered')))),
    firstValueFrom(of(42)),
    lastValueFrom(from([7, 8, 9])),
    // eslint-disable-next-line promise/prefer-await-to-then -- .then not await: keeps the exercise regenerator-free for the ie:11 down-compile (see header)
  ]).then(r => {
    check('reduce_sum', r[0], 15);
    check('scan_running', r[1], [1, 3, 6]);
    check('filter_evens', r[2], [2, 4]);
    check('merge_sync', r[3], [1, 2, 3]);
    check('concat', r[4], [1, 2, 3, 4]);
    check('zip_map', r[5], ['1a', '2b', '3c']);
    check('combineLatest', r[6], [[1, 2]]);
    check('forkJoin', r[7], [[2, 4]]);
    check('mergeMap', r[8], [1, 10, 2, 20]);
    check('switchMap', r[9], [10, 20, 30]);
    check('concatMap', r[10], [1, 1, 2, 2]);
    check('groupBy', r[11], [[1, 3, 5], [2, 4, 6]]);
    check('bufferCount', r[12], [[1, 2], [3, 4], [5, 6]]);
    check('pairwise', r[13], [[1, 2], [2, 3]]);
    check('distinctUntilChanged', r[14], [1, 2, 3, 1]);
    check('catchError', r[15], ['recovered']);
    check('firstValueFrom', r[16], 42);
    check('lastValueFrom', r[17], 9);
    return { checks };
  });
}
