/* eslint-disable @stylistic/no-extra-parens, no-useless-assignment -- chained and parenthesized assignment hosts are the regression inputs */
/* eslint-disable unicorn/consistent-function-style, no-shadow -- arrow callees and shadowed names exercise the receiver proof */
/* eslint-disable qunit/no-ok-equality -- compare identities without passing a constructor to an opaque assertion call */
/* eslint-disable block-scoped-var, prefer-const -- var loop heads and writes after a bodyless loop are the shapes under test */
import PurePromise from '@core-js/pure/actual/promise';

// Babel's standalone rest lowering evaluates all computed keys before the bindings.
// Only the pre-lowering legs can observe and repair the original pattern's key order.
const testBeforeLowering = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;
const nativeFrom = Object.getOwnPropertyDescriptor(Array, 'from')?.value;
const nativeOf = Object.getOwnPropertyDescriptor(Array, 'of')?.value;

QUnit.test('nested static rest: an unused array element runs before the capture', assert => {
  const events = [];
  let held;
  let from;
  let rest;
  const result = ([{ Array: { from, ...rest } }] = [
    held = (events.push('source'), globalThis), events.push(typeof from),
  ]);
  assert.true(result[0] === held);
  assert.true(held === globalThis);
  assert.deepEqual(events, ['source', 'undefined']);
  assert.deepEqual(from([9]), [9]);
  assert.false(Object.hasOwn(rest, 'from'));
});

QUnit.test('static rest at both levels reads the constructor index', assert => {
  let allSettled;
  let inner;
  let outer;
  const held = ({ Promise: { allSettled, ...inner }, ...outer } = globalThis);
  assert.true(held === globalThis);
  assert.same(typeof allSettled, 'function');
  assert.false(Object.hasOwn(inner, 'allSettled'));
  assert.false(Object.hasOwn(outer, 'Promise'));
  if (typeof E2E_DETECT_LOWERED === 'undefined') {
    assert.true(allSettled === Object.getOwnPropertyDescriptor(PurePromise, 'allSettled').value);
  }
  const expected = { ...PurePromise };
  delete expected.allSettled;
  assert.deepEqual(inner, expected);
});

testBeforeLowering('static rest: constructor properties retain their identity and key order', assert => {
  const events = [];
  const { [(events.push('key'), 'all')]: all, ...rest } = (events.push('source'), Promise);
  assert.deepEqual(events, ['source', 'key']);
  assert.true(all === Object.getOwnPropertyDescriptor(PurePromise, 'all').value);
  assert.false(Object.hasOwn(rest, 'all'));
  let race;
  let inner;
  const held = ({ Promise: { race, ...inner } } = globalThis);
  assert.true(held === globalThis);
  assert.true(race === Object.getOwnPropertyDescriptor(PurePromise, 'race').value);
  assert.false(Object.hasOwn(inner, 'race'));
});

testBeforeLowering('static rest: constructor defaults preserve supplied properties', assert => {
  function read({ all, ...rest } = Promise) { return [all, rest]; }
  assert.true(read()[0] === Object.getOwnPropertyDescriptor(PurePromise, 'all').value);
  const custom = () => 7;
  const supplied = read({ all: custom, extra: 8 });
  assert.same(supplied[0], custom);
  assert.deepEqual(supplied[1], { extra: 8 });
  const events = [];
  function computed({ race, ...rest } = globalThis[(events.push('key'), 'self')].Promise) { return [race, rest]; }
  assert.true(computed()[0] === Object.getOwnPropertyDescriptor(PurePromise, 'race').value);
  assert.deepEqual(events, ['key']);
});

QUnit.test('nested iterator extraction evaluates sibling effects once', assert => {
  let count = 0;
  const hit = () => ++count;
  const { w: { [Symbol.iterator]: first }, z } = { w: globalThis, z: (hit(), 1) };
  assert.same(count, 1);
  assert.same(first, undefined);
  assert.same(z, 1);
  const { w: { [Symbol.iterator]: second }, extra } = { extra: (hit(), 2), w: (hit(), globalThis) };
  assert.same(count, 3);
  assert.same(second, undefined);
  assert.same(extra, 2);
});

QUnit.test('a static beside an iterator pattern remains a function', assert => {
  const events = [];
  try {
    const { of, [(events.push(typeof of), Symbol.iterator)]: { name } } = Array;
    events.push(name);
  } catch { /* Array has no iterator method to destructure. */ }
  assert.deepEqual(events, ['function']);
});

QUnit.test('nested iterator assignment evaluates sibling effects once', assert => {
  let count = 0;
  const hit = () => ++count;
  let method, z;
  ({ w: { [Symbol.iterator]: method }, z } = { w: globalThis, z: (hit(), 1) });
  assert.same(count, 1);
  assert.same(method, undefined);
  assert.same(z, 1);
  ({ w: { [Symbol.iterator]: method }, z } = { z: (hit(), 2), w: (hit(), globalThis) });
  assert.same(count, 3);
  assert.same(method, undefined);
  assert.same(z, 2);
});

QUnit.test('captured containers retain later slot writes', assert => {
  const inner = { k: Object };
  const wrapper = { part: inner };
  inner.k = Map;
  const { part: { k: { groupBy } } } = wrapper;
  assert.deepEqual(groupBy([1], x => x).get(1), [1]);
});

QUnit.test('a pattern parameter can replace a captured element slot', assert => {
  const source = [{ w: Array }];
  function install([held]) { held.w = { from: () => [7] }; }
  install(source);
  const [{ w: { from } }] = source;
  assert.deepEqual(from([1]), [7]);
});

QUnit.test('an outer capture survives reassignment and an inner namesake', assert => {
  let Source = Array;
  const captured = [Source];
  Source = { from: () => 9 };
  function read(Source) {
    const [{ from, ...rest }] = captured;
    return [from([1]), Object.hasOwn(rest, 'from'), Source.from()];
  }
  assert.deepEqual(read(Source), [[1], false, 9]);
});

testBeforeLowering('static rest: computed keys observe ordered bindings', assert => {
  const events = [];
  /* eslint-disable no-var -- the key observes the uninitialized var binding */
  var { [(events.push(typeof from), 'from')]: from,
    [(events.push(typeof from), 'isArray')]: isArray, ...rest } = Array;
  /* eslint-enable no-var -- restore declaration style outside the var-head case */
  assert.deepEqual(events, ['undefined', 'function']);
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.true(isArray([]));
  assert.false(Object.hasOwn(rest, 'from'));
  assert.false(Object.hasOwn(rest, 'isArray'));
});

testBeforeLowering('static rest: a retained assignment keeps its receiver and key order', assert => {
  const events = [];
  let of;
  let from;
  let rest;
  function get() {
    events.push('receiver');
    return Array;
  }
  const held = ({ [(events.push(typeof of), 'of')]: of,
    [(events.push(typeof of), 'from')]: from, ...rest } = get());
  assert.same(held, Array);
  assert.deepEqual(events, ['receiver', 'undefined', 'function']);
  assert.deepEqual(of(1), [1]);
  assert.deepEqual(from([2]), [2]);
  assert.false(Object.hasOwn(rest, 'of'));
  assert.false(Object.hasOwn(rest, 'from'));
});

QUnit.test('static rest: nested patterns keep rest at its own level', assert => {
  const { w: { from }, ...outer } = { w: Array, extra: 7 };
  const { w: { of, ...inner } } = { w: Array };
  assert.deepEqual(from([1]), [1]);
  assert.deepEqual(of(2), [2]);
  assert.deepEqual(outer, { extra: 7 });
  assert.false(Object.hasOwn(inner, 'of'));
});

QUnit.test('destructure capture: chained assignments retain both reads and the receiver', assert => {
  let first;
  let second;
  const held = ({ from: first } = ({ from: second } = Array));
  assert.same(held, Array);
  assert.deepEqual(first([1]), [1]);
  assert.deepEqual(second([2]), [2]);
});

QUnit.test('destructure capture: a chained nested rest keeps its container', assert => {
  let from;
  let rest;
  const source = { w: Array, extra: 7 };
  const held = ({ w: { from }, ...rest } = ({ w: { from }, ...rest } = source));
  assert.true(held === source);
  assert.deepEqual(from([1]), [1]);
  assert.deepEqual(rest, { extra: 7 });
});

QUnit.test('static rest: a nested capture binds before the outer rest getter', assert => {
  let from;
  let rest;
  const seen = [];
  const source = {
    w: Array,
    get extra() {
      seen.push(typeof from);
      return 7;
    },
  };
  const held = ({ w: { from }, ...rest } = source);
  assert.true(held === source);
  assert.deepEqual(seen, ['function']);
  assert.deepEqual(from([1]), [1]);
  assert.deepEqual(rest, { extra: 7 });
});

QUnit.test('static rest: a guarded nested assignment rejects before binding', assert => {
  let of = 7;
  let rest = 8;
  const guard = false;
  assert.throws(() => { ({ Array: { of, ...rest } } = guard && globalThis); }, TypeError);
  assert.same(of, 7);
  assert.same(rest, 8);
  const enabled = true;
  ({ Array: { of, ...rest } } = enabled && globalThis);
  assert.deepEqual(of(1), [1]);
  assert.false(Object.hasOwn(rest, 'of'));
});

QUnit.test('static rest: a nested getter is read once before the rest copy', assert => {
  let from;
  let rest;
  let count = 0;
  const source = {
    get w() {
      count++;
      return Array;
    },
    extra: 7,
  };
  const held = ({ w: { from }, ...rest } = source);
  assert.true(held === source);
  assert.same(count, 1);
  assert.deepEqual(from([1]), [1]);
  assert.deepEqual(rest, { extra: 7 });
});

QUnit.test('destructure capture: a chained array rest keeps its container', assert => {
  let from;
  let rest;
  const source = [Array];
  const held = ([{ from, ...rest }] = ([{ from, ...rest }] = source));
  assert.true(held === source);
  assert.deepEqual(from([2]), [2]);
  assert.false(Object.hasOwn(rest, 'from'));
});

QUnit.test('static rest: for-init effects precede the extracted binding', assert => {
  const events = [];
  function observe(fn) { events.push(typeof fn()); }
  /* eslint-disable no-var -- observe the binding before its initialization */
  for (var { Array: { from }, ...rest } = (observe(() => from), globalThis); false;) { /* empty */ }
  /* eslint-enable no-var -- restore declaration style outside the var-head case */
  assert.deepEqual(events, ['undefined']);
  assert.deepEqual(from([3]), [3]);
  assert.false(Object.hasOwn(rest, 'Array'));
});

QUnit.test('static rest: extracted calls retain their result type', assert => {
  const { from: make, ...rest } = Array;
  assert.same(make([1, 2]).at(-1), 2);
  assert.false(Object.hasOwn(rest, 'from'));
});

QUnit.test('destructure mirror: instance defaults survive beside static leaves', assert => {
  let flat;
  let of;
  ({ Array: { prototype: { flat = () => 9 }, of } } = globalThis);
  assert.deepEqual(flat.call([[1]]), [1]);
  assert.deepEqual(of(2), [2]);
});

QUnit.test('static rest: an array-wrapped parameter retains native reads', assert => {
  function read([{ of, from, ...rest }]) { return [of, from, Object.hasOwn(rest, 'of')]; }
  const result = read([Array]);
  assert.same(result[0], nativeOf);
  assert.same(result[1], nativeFrom);
  assert.false(result[2]);
});

QUnit.test('static rest: an array-wrapped loop extracts statics', assert => {
  let result;
  for (const [{ of, from, ...rest }] of [[Array]]) result = [of(3), from([4]), Object.hasOwn(rest, 'from')];
  assert.deepEqual(result, [[3], [4], false]);
});

QUnit.test('static rest: an aliased array stays intact across parameter binding and iteration', assert => {
  const source = [Array];
  function read([{ from, ...rest }]) { return [from, Object.hasOwn(rest, 'from')]; }
  const result = read(source);
  assert.same(result[0], nativeFrom);
  assert.false(result[1]);
  assert.true(source[0] === Array);
  for (const [{ from, ...rest }] of [source]) {
    assert.deepEqual(from([2]), [2]);
    assert.false(Object.hasOwn(rest, 'from'));
  }
  assert.true(source[0] === Array);
});

QUnit.test('static rest: a written array slot keeps the replacement', assert => {
  const source = [Array];
  const custom = () => 9;
  source[0] = { from: custom, extra: 7 };
  const [{ from, ...rest }] = source;
  assert.same(from, custom);
  assert.same(from(), 9);
  assert.deepEqual(rest, { extra: 7 });
});

QUnit.test('static rest: a selecting receiver retains its effect', assert => {
  let calls = 0;
  function pick() {
    calls++;
    return true;
  }
  const { from, ...rest } = pick() ? Array : Array;
  assert.same(calls, 1);
  assert.deepEqual(from([5]), [5]);
  assert.false(Object.hasOwn(rest, 'from'));
});

QUnit.test('static rest: a user receiver keeps getters and its own method', assert => {
  const events = [];
  const method = () => 'custom';
  const source = {
    get from() {
      events.push('from');
      return method;
    },
    get extra() {
      events.push('extra');
      return 8;
    },
  };
  const { [(events.push('key'), 'from')]: from, ...rest } = source;
  assert.same(from, method);
  assert.deepEqual(rest, { extra: 8 });
  assert.deepEqual(events, ['key', 'from', 'extra']);
});

QUnit.test('normalized assignment capture: the tail yields the original receiver', assert => {
  let calls = 0;
  let from;
  let saved;
  function get() {
    calls++;
    return Array;
  }
  const held = (({ from } = (saved = get())), saved);
  assert.same(held, Array);
  assert.same(calls, 1);
  assert.deepEqual(from([6]), [6]);
});

QUnit.test('an explicit pure index retains destructured static identity and source effects', assert => {
  const events = [];
  const { all } = (events.push('source'), PurePromise);
  assert.same(all, Object.getOwnPropertyDescriptor(PurePromise, 'all').value);
  function source() {
    events.push('call');
    return { value: PurePromise };
  }
  const returned = source().value.all;
  const box = { value: PurePromise };
  const { value: { all: nested } } = box;
  assert.same(returned, all);
  assert.same(nested, all);
  assert.deepEqual(events, ['source', 'call']);
  return all.call(PurePromise, [1, 2]).then(values => assert.deepEqual(values, [1, 2]));
});
