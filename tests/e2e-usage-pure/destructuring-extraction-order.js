/* eslint-disable prefer-const -- Assignment targets are under test. */
import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('destructuring: static extraction precedes a dependent residual', assert => {
  const events = [];
  const holder = { get A() {
    events.push('init');
    return Array;
  } };
  const { from, make = from } = holder.A;
  assert.deepEqual(make([7]), [7]);
  assert.deepEqual(events, ['init']);
  events.length = 0;
  const { from: read, [(events.push(typeof read), 'of')]: of } = holder.A;
  assert.deepEqual(of(8), [8]);
  assert.deepEqual(events, ['init', 'function']);
});

QUnit.test('destructuring: nested extraction precedes a sibling default', assert => {
  const events = [];
  const holder = { get realm() {
    events.push('init');
    return globalThis;
  } };
  const { Array: { from }, make = from } = holder.realm;
  assert.deepEqual(make([7]), [7]);
  assert.deepEqual(events, ['init']);
  let of, made;
  ({ Array: { of }, made = of } = holder.realm);
  assert.deepEqual(made(8), [8]);
  assert.deepEqual(events, ['init', 'init']);
});

QUnit.test('destructuring: a method default stays between native siblings', assert => {
  const events = [];
  function fallback() {
    events.push('u');
    return { x: 7 };
  }
  function defaultAt(value) {
    events.push(`at:${ value }`);
    return 8;
  }
  function key(value) {
    events.push(value);
    return 'after';
  }
  function read(source) {
    const { y: { u: { x } = fallback(), at = defaultAt(typeof x), [key(at)]: after = at } } = { y: source };
    return [x, at, after];
  }
  assert.deepEqual(read({}), [7, 8, 8]);
  assert.deepEqual(events, ['u', 'at:number', 8]);
});

QUnit.test('destructuring: rest reads before the later constructor binding', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Number, 'orderProbe');
  const events = [];
  function observe() {
    // eslint-disable-next-line block-scoped-var -- Observe the function-scoped var before its destructuring write.
    events.push(typeof W);
    return 7;
  }
  Object.defineProperty(Number, 'orderProbe', { configurable: true, enumerable: true, get: observe });
  try {
    // eslint-disable-next-line no-var -- var observes the uninitialized binding after ES5 lowering too.
    var { Number: { isInteger, ...numbers }, WeakMap: W } = (events.push('prefix'), globalThis);
    assert.true(isInteger(7));
    assert.same(numbers.orderProbe, 7);
    assert.same(typeof W, 'function');
    assert.deepEqual(events, ['prefix', 'undefined']);
  } finally {
    restoreProperty(Number, 'orderProbe', descriptor);
  }
});

QUnit.test('destructuring: an iterator default stays between native siblings', assert => {
  const events = [];
  function read(source) {
    const { y: {
      before = (events.push('before'), 1),
      [Symbol.iterator]: iterator = (events.push('default'), 7),
      after = (events.push(typeof iterator), iterator),
    } } = { y: source };
    return [before, iterator, after];
  }
  assert.deepEqual(read({}), [1, 7, 7]);
  assert.deepEqual(events, ['before', 'default', 'number']);
  events.length = 0;
  let before, iterator, after;
  ({ y: {
    before = (events.push('before'), 1),
    [Symbol.iterator]: iterator = (events.push('default'), 7),
    after = (events.push(typeof iterator), iterator),
  } } = { y: {} });
  assert.deepEqual([before, iterator, after], [1, 7, 7]);
  assert.deepEqual(events, ['before', 'default', 'number']);
});

QUnit.test('destructuring: a null rest source throws before writing the extracted target', assert => {
  function read(enabled) {
    let of = 'old',
        rest;
    try {
      ({ Array: { of, ...rest } } = enabled && globalThis);
    } catch (error) {
      return [error.name, of, rest];
    }
  }
  assert.deepEqual(read(false), ['TypeError', 'old', undefined]);
});

QUnit.test('destructuring: a native nested sibling precedes each method read', assert => {
  const events = [];
  const make = new Function('events', 'observe', `
    var current = function () { return 1; };
    return { y: {
      get other() {
        events.push('other:' + observe());
        current = function () { return 2; };
        return { q: 7 };
      },
      get at() { events.push('at'); return current; },
      get includes() { events.push('includes'); return function () { return true; }; }
    } };
  `);
  function read() {
    const box = make(events, () => typeof at);
    const enabled = true;
    // eslint-disable-next-line no-var -- Observe the bodyless var binding before its source write.
    if (enabled) var { y: { other: { q }, at, includes } } = { y: box.y },
                     end = events.push('end');
    return [q, at(), includes(), end];
  }
  assert.deepEqual(read(), [7, 2, true, 4]);
  assert.deepEqual(events, ['other:undefined', 'at', 'includes', 'end']);
});

QUnit.test('destructuring: an assignment captures its native sibling after an earlier claim', assert => {
  const events = [];
  const make = new Function('events', 'observe', `
    var row = [8];
    Object.defineProperty(row, 'other', { get: function () {
      events.push('other:' + observe());
      return { q: 7 };
    } });
    return {
      get includes() { events.push('includes'); return function () {}; },
      get y() { events.push('y'); return row; }
    };
  `);
  function read() {
    let inc, q, at;
    const box = make(events, () => typeof inc);
    ({ includes: inc, y: { other: { q }, at } } = box);
    return [q, at.call([8], 0)];
  }
  assert.deepEqual(read(), [7, 8]);
  assert.deepEqual(events, ['includes', 'y', 'other:function']);
});

let rows = [];
function rebind() {
  rows = { at: () => 99 };
  return {};
}
QUnit.test('destructuring: a rebound source keeps its captured instance method', assert => {
  const before = 1,
        { y: { 0: { first } = rebind(), at } } = { y: rows };
  assert.same(before, 1);
  assert.same(first, undefined);
  assert.same(at.call([8], 0), 8);
});
