// Opaque member arguments keep their evaluation count and their container's later reads.
export function make(Format) {
  const r = new Format();
  return r.x.y;
}

export function collect(a) {
  const r = [];
  r.push(a.b, a.b);
  return r;
}

export function f(g) {
  const C = [];
  {
    const a = g();
    C.push(a.b, a.b);
  }
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the source intentionally throws after collecting arguments
  return C.x.y;
}

QUnit.test('container arguments: namesake bindings and repeated getters', assert => {
  function Format() {
    this.x = { y: 17 };
  }
  let reads = 0;
  assert.same(make(Format), 17);
  const source = Object.defineProperty({}, 'b', { get() { return ++reads; } });
  assert.deepEqual(collect(source), [1, 2]);
  assert.same(reads, 2);
});

QUnit.test('container arguments: a block-local source preserves effects before a throw', assert => {
  const log = [];
  assert.throws(() => f(() => {
    log.push('call');
    return Object.defineProperty({}, 'b', { get() {
      log.push('get');
      return 1;
    } });
  }), TypeError);
  assert.deepEqual(log, ['call', 'get', 'get']);
});

QUnit.test('container arguments: cloned declarations retain slot writes', assert => {
  const effects = [];
  const values = [];
  for (let i = 0; i < 1; i++) values.push((() => {
    const source = { slot: { ctor: Array } };
    const holder = { item: source };
    source.slot.ctor = { from() {
      effects.push('custom');
      return [9];
    } };
    return holder.item.slot.ctor.from([1, 2]);
  })());
  assert.deepEqual(values, [[9]]);
  assert.deepEqual(effects, ['custom']);
});

QUnit.test('container arguments: aliases and class fields keep their written methods', assert => {
  const effects = [];
  const custom = { from() {
    effects.push('custom');
    return [9];
  } };
  const box = { item: Array };
  const alias = box;
  box.item = custom;
  const { item } = alias;
  assert.deepEqual(item.from([1]), [9]);
  // eslint-disable-next-line unicorn/no-static-only-class -- exercise class declaration ownership
  class Box { static item = Array; }
  Box.item = custom;
  assert.deepEqual(Box.item.from([1]), [9]);
  assert.deepEqual(effects, ['custom', 'custom']);
});

QUnit.test('container arguments: pattern capture precedes a later slot write', assert => {
  const values = [];
  values.push((() => {
    const box = { item: Array };
    const alias = box;
    const { item } = alias;
    box.item = {};
    return item.from([1, 2]);
  })());
  assert.deepEqual(values, [[1, 2]]);
});

QUnit.test('container arguments: class capture precedes a later slot write', assert => {
  const values = [];
  values.push((() => {
    // eslint-disable-next-line unicorn/no-static-only-class -- exercise class field capture
    class Box { static item = Array; }
    // eslint-disable-next-line prefer-destructuring -- exercise the member-capture path
    const item = Box.item;
    Box.item = {};
    return item.from([1, 2]);
  })());
  assert.deepEqual(values, [[1, 2]]);
});

QUnit.test('container arguments: a later write preserves a captured Object static', assert => {
  const written = { w: Object };
  const writtenAlias = written.w;
  written.w = Array;
  assert.deepEqual(writtenAlias.values({ a: 1 }), [1]);
});

QUnit.test('container arguments: a local writer keeps its replacement method', assert => {
  const effects = [];
  function writes(t) {
    t.k = { entries() {
      effects.push('custom');
      return [['written', 9]];
    } };
    return t.k;
  }
  const box = { k: Object };
  writes(box);
  const { k: { entries } } = box;
  assert.deepEqual(entries({ a: 1 }), [['written', 9]]);
  assert.deepEqual(effects, ['custom']);
});

/* eslint-disable no-var, no-redeclare, no-lone-blocks, block-scoped-var -- exercise one hoisted binding across sibling blocks */
QUnit.test('container arguments: a var sibling write follows the earlier static read', assert => {
  let captured;
  {
    var shared = { w: Object };
    ({ getOwnPropertyNames: captured } = shared.w);
  }
  {
    var shared = { w: Array };
    shared.w = Map;
  }
  assert.deepEqual(captured({ a: 1 }), ['a']);
});

QUnit.test('container arguments: assignment captures are fresh on every invocation', assert => {
  const values = [];
  for (let i = 0; i < 2; i++) values.push((() => {
    let item;
    {
      var box = { item: Array };
      item = box.item;
    }
    {
      var box = { item: {} };
      box.item = {};
    }
    return item.from([1, 2]);
  })());
  assert.deepEqual(values, [[1, 2], [1, 2]]);
});
/* eslint-enable no-var, no-redeclare, no-lone-blocks, block-scoped-var -- end hoisted-binding cases */

QUnit.test('container arguments: a closure reads groupBy on both sides of a bound write', assert => {
  function fill(target) { target.C = Map; }
  const box = { C: Object };
  const held = fill.bind(null, box);
  function capture() { return box.C.groupBy; }
  const before = capture();
  held();
  const after = capture();
  assert.same(before([7], Boolean).true[0], 7);
  assert.same(after([8], Boolean).get(true)[0], 8);
});

QUnit.test('container arguments: destructuring a written slot evaluates its key before the default', assert => {
  const order = [];
  const box = { s: Object };
  box.s = Array;
  // eslint-disable-next-line no-sequences -- the computed key has an effect and a known value
  const { from, missing = order.push('default') } = box[order.push('key'), 's'];
  assert.deepEqual(from([3]), [3]);
  assert.same(missing, 2);
  assert.deepEqual(order, ['key', 'default']);
});
