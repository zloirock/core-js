// A headless RxJS pipeline: interop, operators, schedulers, subjects and error classes, self-checked
// by the values and the side-effect order they produce.
//
// The centrepiece is `innerFrom`, rxjs's interop hub: an Observable, an interop observable, an
// array-like, a promise, a sync iterable and an async iterable all reach it, so the well-known-symbol
// lookups and the iteration that follows happen inside rxjs rather than here. Its two remaining
// branches stay out on purpose - a ReadableStream is not something core-js puts on the target, and
// the invalid-input branch would assert rxjs's own error text rather than a polyfill.
//
// No CHECK here may depend on spread, `for-of`, `async` or a generator: those compile to Babel
// helpers that reach for the stdlib from THIS module, which proves nothing about rxjs. `from(new
// Set(...))` puts the same protocol where it belongs, and the regenerator machinery that does run is
// the one tslib ships inside the rxjs bundle. The file is not helper-free either way - the array
// destructuring below emits one that asks for `Symbol.iterator` - and that is harmless exactly
// because no assertion rides on it.
//
// Accepted deliberately: the `usage-pure/pre` cell is green on IE11 while the phase gap it stands for
// is still open - nothing here walks into the unrewritten `Array.from` that sits in that bundle. rxjs
// ships an ES5 build, so the signal would be about this file's syntax rather than about the library;
// `three` carries the phase diagnostic instead. Do not add spread or `for-of` to make this cell red.
import {
  of, from, range, merge, concat, zip, combineLatest, forkJoin, throwError, defer, generate,
  EMPTY, NEVER, scheduled, pairs, partition, connectable, observable as symbolObservable,
  BehaviorSubject, ReplaySubject, AsyncSubject, Subject, Subscription, Notification,
  firstValueFrom, lastValueFrom, queueScheduler, asapScheduler, asyncScheduler,
  EmptyError, ArgumentOutOfRangeError, NotFoundError, SequenceError, ObjectUnsubscribedError,
  map, filter, reduce, scan, toArray, mergeMap, switchMap, concatMap, exhaustMap, expand, mergeScan,
  groupBy, bufferCount, pairwise, distinctUntilChanged, distinct, distinctUntilKeyChanged,
  catchError, debounceTime, throttleTime, withLatestFrom, zipWith, raceWith, concatWith, mergeWith,
  count, min, max, every, find, findIndex, elementAt, isEmpty, defaultIfEmpty, sequenceEqual,
  single, last, first, startWith, endWith, materialize, dematerialize, shareReplay,
  observeOn, subscribeOn, windowCount, ignoreElements, finalize, tap, retry, repeat, throwIfEmpty,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { checker, eq } from './checks.mjs';

function collect(obs) {
  return firstValueFrom(obs.pipe(toArray()));
}
// Inputs for rxjs's interop hub (`innerFrom`). Built by hand rather than with generator syntax so
// the machinery that runs is rxjs's, not a regenerator runtime of ours.
function customIterable(values) {
  const it = {};
  it[Symbol.iterator] = function () {
    let i = 0;
    return { next() { return i < values.length ? { value: values[i++], done: false } : { value: undefined, done: true }; } };
  };
  return it;
}
function customAsyncIterable(values) {
  const it = {};
  it[Symbol.asyncIterator] = function () {
    let i = 0;
    return { next() { return Promise.resolve(i < values.length ? { value: values[i++], done: false } : { value: undefined, done: true }); } };
  };
  return it;
}
// `symbolObservable` is rxjs's OWN interop symbol export, so this agrees with it by construction
// whether or not the engine/polyfill has `Symbol.observable`.
function interopObservable(values) {
  const it = {};
  it[symbolObservable] = function () {
    return {
      subscribe(subscriber) {
        values.forEach(v => subscriber.next(v));
        subscriber.complete();
        return { unsubscribe() { /* nothing to release */ } };
      },
    };
  };
  return it;
}

export function run() {
  const { checks, check } = checker();

  // --- subjects ---
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

  // multi-observer Subject: `Subject#next` snapshots its observers with Array.from
  const multi = new Subject();
  const seenA = [];
  const seenB = [];
  multi.subscribe(v => seenA.push(v));
  multi.subscribe(v => seenB.push(v));
  multi.next('x');
  check('subject_multicast', [seenA, seenB], [['x'], ['x']]);

  const as = new AsyncSubject();
  const asSeen = [];
  as.subscribe(v => asSeen.push(v));
  as.next(1);
  as.next(2);
  as.complete();
  check('AsyncSubject_lastOnly', asSeen, [2]);

  // ObjectUnsubscribedError
  const dead = new Subject();
  dead.unsubscribe();
  let unsubErr = null;
  try {
    dead.next(1);
  } catch (err) {
    unsubErr = err instanceof ObjectUnsubscribedError;
  }
  check('ObjectUnsubscribedError', unsubErr, true);

  // Subscription with TWO parents -> `_hasParent` takes the Array#includes branch
  const child = new Subscription();
  const p1 = new Subscription();
  const p2 = new Subscription();
  p1.add(child);
  p2.add(child);
  p1.add(child); // the second add from the same parent is what makes `_hasParent` matter
  check('subscription_two_parents', child.closed, false);
  p1.unsubscribe();
  p2.unsubscribe();
  check('subscription_closed_after_parents', child.closed, true);

  // --- virtual time ---
  const debounced = [];
  new TestScheduler(() => { /* value-level checks below */ }).run(({ cold }) => {
    cold('a-b-c-d|', { a: 1, b: 2, c: 3, d: 4 }).pipe(debounceTime(10)).subscribe(v => debounced.push(v));
  });
  check('debounceTime_keepsLast', debounced, [4]);

  const throttled = [];
  new TestScheduler(() => { /* value-level checks below */ }).run(({ cold }) => {
    cold('a-b-c-d|', { a: 1, b: 2, c: 3, d: 4 }).pipe(throttleTime(10)).subscribe(v => throttled.push(v));
  });
  check('throttleTime_keepsFirst', throttled, [1]);

  // exhaustMap only means something with an inner that outlives the next source emission
  const exhaustOut = [];
  const exhaustSrc = new Subject();
  const exhaustInner = new Subject();
  exhaustSrc.pipe(exhaustMap(x => x === 1 ? exhaustInner : of(x * 100))).subscribe(v => exhaustOut.push(v));
  exhaustSrc.next(1); // opens the inner
  exhaustSrc.next(2); // dropped - the inner is still active
  exhaustInner.next('inner');
  exhaustInner.complete();
  exhaustSrc.next(3); // accepted again
  check('exhaustMap_drops_while_active', exhaustOut, ['inner', 300]);

  // rxjs builds its error classes by hand (`createErrorClass` -> `Object.create(Error.prototype)`),
  // so `instanceof` here is checking a prototype chain assembled at runtime, not a native subclass
  const errs = [];
  function catchInto(label, obs, Klass) {
    obs.subscribe({ next() { /* not expected to emit */ }, error(err) { errs.push([label, err instanceof Klass]); } });
  }
  catchInto('elementAt', of('a').pipe(elementAt(10)), ArgumentOutOfRangeError);
  catchInto('throwIfEmpty', EMPTY.pipe(throwIfEmpty()), EmptyError);
  catchInto('single_none', of(1, 2).pipe(single(x => x > 5)), NotFoundError);
  catchInto('single_many', of(1, 2).pipe(single(x => x > 0)), SequenceError);
  check('error_classes', errs, [['elementAt', true], ['throwIfEmpty', true], ['single_none', true], ['single_many', true]]);

  // multicasting: one subscription to the source shared by two consumers
  let sourceSubscribes = 0;
  function countedSource() {
    sourceSubscribes++;
    return of(1, 2);
  }
  const shared = defer(countedSource).pipe(shareReplay({ bufferSize: 2, refCount: false }));
  const sharedA = [];
  const sharedB = [];
  shared.subscribe(v => sharedA.push(v));
  shared.subscribe(v => sharedB.push(v));
  check('shareReplay_one_source', [sourceSubscribes, sharedA, sharedB], [1, [1, 2], [1, 2]]);

  const conn = connectable(of('c1', 'c2'));
  const connSeen = [];
  conn.subscribe(v => connSeen.push(v));
  check('connectable_before_connect', connSeen, []);
  conn.connect();
  check('connectable_after_connect', connSeen, ['c1', 'c2']);

  const [evens, odds] = partition(of(1, 2, 3, 4), x => x % 2 === 0);
  const evenSeen = [];
  const oddSeen = [];
  evens.subscribe(v => evenSeen.push(v));
  odds.subscribe(v => oddSeen.push(v));
  check('partition', [evenSeen, oddSeen], [[2, 4], [1, 3]]);

  // lifecycle side effects, plus resubscription
  const trace = [];
  of('t').pipe(tap({ next: v => trace.push(`next:${ v }`), complete: () => trace.push('complete') }), finalize(() => trace.push('finalize'))).subscribe();
  check('tap_finalize_order', trace, ['next:t', 'complete', 'finalize']);

  let attempts = 0;
  const retried = [];
  function failsTwice() {
    attempts++;
    return attempts < 3 ? throwError(() => new Error('again')) : of('ok');
  }
  defer(failsTwice).pipe(retry(5)).subscribe(v => retried.push(v));
  check('retry', [attempts, retried], [3, ['ok']]);

  const repeated = [];
  of('r').pipe(repeat(3)).subscribe(v => repeated.push(v));
  check('repeat', repeated, ['r', 'r', 'r']);

  // Notification round-trip
  const notified = [];
  Notification.createNext('n').observe({ next: v => notified.push(v), error() { /* unused */ }, complete() { /* unused */ } });
  check('notification_observe', notified, ['n']);

  // full marble assertion: expectObservable drives TestScheduler's own Map/Array.from/trim path.
  // Every verdict is COLLECTED, not assigned: `flush()` invokes the comparator once per registered
  // expectation, so an assignment would let the second (subscription) verdict overwrite the first
  // (value) one - and the value comparison is the whole point of the check. Pinning the ARRAY also
  // reddens if an expectation silently stops running.
  const marbleVerdicts = [];
  new TestScheduler((actual, expected) => marbleVerdicts.push(eq(actual, expected))).run(({ cold, expectObservable, expectSubscriptions }) => {
    const source = cold(' -a--b--c|', { a: 1, b: 2, c: 3 });
    const subs = '       ^-------!';
    expectObservable(source.pipe(map(x => x * 10))).toBe('-a--b--c|', { a: 10, b: 20, c: 30 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
  check('marble_assertion', marbleVerdicts, [true, true]);

  // via a var: the Set dedups at runtime, without tripping a literal-duplicate lint rule
  const setInput = [3, 1, 3, 2, 1];

  return Promise.all([
    // --- innerFrom: every branch of rxjs's interop hub ---
    collect(from(new Set(setInput))),
    collect(from(new Map([['a', 1], ['b', 2]]))),
    collect(from(customIterable([4, 5, 6]))),
    collect(from(customAsyncIterable([7, 8]))),
    collect(from(interopObservable([9, 10]))),
    collect(from(Promise.resolve('promised'))),
    collect(from({ length: 3, 0: 'l0', 1: 'l1', 2: 'l2' })),
    collect(scheduled(new Set(['s1', 's2']), queueScheduler)),
    collect(scheduled(customAsyncIterable(['a1']), asyncScheduler)),
    collect(of('asap').pipe(observeOn(asapScheduler))),
    collect(of('queued').pipe(subscribeOn(queueScheduler))),
    collect(pairs({ p: 1, q: 2 })),

    // --- transformation / filtering ---
    firstValueFrom(of(1, 2, 3, 4, 5).pipe(reduce((a, b) => a + b, 0))),
    collect(of(1, 2, 3).pipe(scan((a, b) => a + b, 0))),
    collect(range(1, 5).pipe(filter(x => x % 2 === 0))),
    collect(of(1, 2, 2, 3, 1).pipe(distinct())),
    collect(of({ k: 1 }, { k: 1 }, { k: 2 }).pipe(distinctUntilKeyChanged('k'), map(o => o.k))),
    collect(of(1, 2, 3, 4, 5, 6).pipe(groupBy(x => x % 2), mergeMap(g => g.pipe(toArray())))),
    collect(range(1, 6).pipe(bufferCount(2))),
    collect(of(1, 2, 3).pipe(pairwise())),
    collect(of(1, 1, 2, 2, 3, 1).pipe(distinctUntilChanged())),
    collect(range(1, 5).pipe(windowCount(2), mergeMap(w => w.pipe(toArray())))),

    // --- combination ---
    collect(merge(of(1), of(2), of(3))),
    collect(concat(of(1, 2), of(3, 4))),
    collect(zip(of(1, 2, 3), of('a', 'b', 'c')).pipe(map(([n, s]) => `${ n }${ s }`))),
    collect(combineLatest([of(1), of(2)])),
    collect(forkJoin([of(1, 2), of(3, 4)])),
    collect(of(1, 2).pipe(mergeMap(x => of(x, x * 10)))),
    collect(of(1, 2, 3).pipe(switchMap(x => of(x * 10)))),
    collect(of(1, 2).pipe(concatMap(x => of(x, x)))),
    collect(of(1).pipe(expand(x => x < 8 ? of(x * 2) : EMPTY))),
    collect(of(1, 2, 3).pipe(mergeScan((acc, x) => of(acc + x), 0))),
    collect(of('w').pipe(withLatestFrom(of('L')))),
    collect(of(1).pipe(zipWith(of('z')))),
    collect(of('fast').pipe(raceWith(NEVER))),
    collect(of(1).pipe(concatWith(of(2)), mergeWith(of(3)))),
    collect(of(2, 3).pipe(startWith(1), endWith(4))),

    // --- aggregates & assertions ---
    firstValueFrom(of(1, 2, 3).pipe(count())),
    firstValueFrom(of(5, 2, 9).pipe(min())),
    firstValueFrom(of(5, 2, 9).pipe(max())),
    firstValueFrom(of(2, 4).pipe(every(x => x % 2 === 0))),
    firstValueFrom(of(1, 5, 8).pipe(find(x => x > 4))),
    firstValueFrom(of(1, 5, 8).pipe(findIndex(x => x > 4))),
    firstValueFrom(of('a', 'b', 'c').pipe(elementAt(1))),
    firstValueFrom(EMPTY.pipe(isEmpty())),
    firstValueFrom(EMPTY.pipe(defaultIfEmpty('fallback'))),
    firstValueFrom(of(1, 2).pipe(sequenceEqual(of(1, 2)))),
    firstValueFrom(of('only').pipe(single())),
    firstValueFrom(of(1, 2, 3).pipe(last())),
    firstValueFrom(of(1, 2, 3).pipe(first(x => x > 1))),

    // --- notifications, errors, multicasting, lifecycle ---
    collect(of(1, 2).pipe(materialize(), map(n => n.kind))),
    collect(of(1).pipe(materialize(), dematerialize())),
    collect(throwError(() => new Error('boom')).pipe(catchError(() => of('recovered')))),
    collect(defer(() => of('deferred'))),
    collect(generate(0, x => x < 3, x => x + 1)),
    collect(of(1, 2, 3).pipe(ignoreElements(), defaultIfEmpty('ignored'))),

    firstValueFrom(of(42)),
    lastValueFrom(from([7, 8, 9])),
    // eslint-disable-next-line promise/prefer-await-to-then -- keeps this module regenerator-free
  ]).then(r => {
    let i = 0;
    function nx() {
      return r[i++];
    }
    check('from_set', nx(), [3, 1, 2]);
    check('from_map', nx(), [['a', 1], ['b', 2]]);
    check('from_custom_iterable', nx(), [4, 5, 6]);
    check('from_async_iterable', nx(), [7, 8]);
    check('from_interop_observable', nx(), [9, 10]);
    check('from_promise', nx(), ['promised']);
    check('from_array_like', nx(), ['l0', 'l1', 'l2']);
    check('scheduled_iterable_queue', nx(), ['s1', 's2']);
    check('scheduled_async_iterable', nx(), ['a1']);
    check('observeOn_asap', nx(), ['asap']);
    check('subscribeOn_queue', nx(), ['queued']);
    check('pairs_object_entries', nx(), [['p', 1], ['q', 2]]);

    check('reduce_sum', nx(), 15);
    check('scan_running', nx(), [1, 3, 6]);
    check('filter_evens', nx(), [2, 4]);
    check('distinct', nx(), [1, 2, 3]);
    check('distinctUntilKeyChanged', nx(), [1, 2]);
    check('groupBy', nx(), [[1, 3, 5], [2, 4, 6]]);
    check('bufferCount', nx(), [[1, 2], [3, 4], [5, 6]]);
    check('pairwise', nx(), [[1, 2], [2, 3]]);
    check('distinctUntilChanged', nx(), [1, 2, 3, 1]);
    check('windowCount', nx(), [[1, 2], [3, 4], [5]]);

    check('merge_sync', nx(), [1, 2, 3]);
    check('concat', nx(), [1, 2, 3, 4]);
    check('zip_map', nx(), ['1a', '2b', '3c']);
    check('combineLatest', nx(), [[1, 2]]);
    check('forkJoin', nx(), [[2, 4]]);
    check('mergeMap', nx(), [1, 10, 2, 20]);
    check('switchMap', nx(), [10, 20, 30]);
    check('concatMap', nx(), [1, 1, 2, 2]);
    check('expand', nx(), [1, 2, 4, 8]);
    check('mergeScan', nx(), [1, 3, 6]);
    check('withLatestFrom', nx(), [['w', 'L']]);
    check('zipWith', nx(), [[1, 'z']]);
    check('raceWith', nx(), ['fast']);
    check('concatWith_mergeWith', nx(), [1, 2, 3]);
    check('startWith_endWith', nx(), [1, 2, 3, 4]);

    check('count', nx(), 3);
    check('min', nx(), 2);
    check('max', nx(), 9);
    check('every', nx(), true);
    check('find', nx(), 5);
    check('findIndex', nx(), 1);
    check('elementAt', nx(), 'b');
    check('isEmpty', nx(), true);
    check('defaultIfEmpty', nx(), 'fallback');
    check('sequenceEqual', nx(), true);
    check('single', nx(), 'only');
    check('last', nx(), 3);
    check('first_predicate', nx(), 2);

    check('materialize_kinds', nx(), ['N', 'N', 'C']);
    check('dematerialize', nx(), [1]);
    check('catchError', nx(), ['recovered']);
    check('defer', nx(), ['deferred']);
    check('generate', nx(), [0, 1, 2]);
    check('ignoreElements', nx(), ['ignored']);
    check('firstValueFrom', nx(), 42);
    check('lastValueFrom', nx(), 9);
    return { checks };
  });
}
