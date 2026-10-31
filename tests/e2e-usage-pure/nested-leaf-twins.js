/* eslint-disable es/no-nonstandard-array-prototype-properties -- Own array slots are deliberate residual-binding probes. */

QUnit.test('nested leaf twins share the hop with a surviving leaf and rest', assert => {
  const effects = [];
  const rows = [4, 9];
  // Getter-backed rest stays native in pure; supply the method this boundary reads.
  Object.defineProperty(rows, 'at', { value(index) { return this[this.length + index]; } });
  const source = { get data() {
    effects.push('hop');
    return rows;
  } };
  const { data: { at, length, ...rest } } = source;
  assert.same(at.call(rows, -1), 9);
  assert.same(length, 2);
  assert.deepEqual(rest, { 0: 4, 1: 9 });
  assert.deepEqual(effects, ['hop']);
});

QUnit.test('nested leaf twins keep preceding reads, slot defaults and key effects', assert => {
  const effects = [];
  const source = { get data() {
    effects.push('hop');
    return undefined;
  } };
  const lead = (effects.push('lead'), 1),
        { data: { [(effects.push('key'), 'at')]: method, length } = (effects.push('default'), [4, 9]) }
          = (effects.push('prefix'), source);
  assert.same(lead + length, 3);
  assert.same(method.call([5, 8], -1), 8);
  assert.deepEqual(effects, ['lead', 'prefix', 'hop', 'default', 'key']);
});

QUnit.test('nested leaf twins retain a wrapped static read and its default', assert => {
  const effects = [];
  const source = { get fn() {
    effects.push('fn');
    return Array;
  } };
  // Static synthesis through a literal wrapper is intentionally absent in pure.
  const { fn: { from = value => [...value], name } } = source;
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.same(typeof name, 'string');
  assert.deepEqual(effects, ['fn']);
});

QUnit.test('nested leaf twins preserve assignment and loop default reads', assert => {
  const effects = [];
  let method, size;
  // eslint-disable-next-line prefer-const -- Exercise the assignment host.
  ({ data: { at: method, length: size } } = (effects.push('assignment'), { data: [4, 9] }));
  assert.same(method.call([3, 7], -1), 7);
  assert.same(size, 2);
  // eslint-disable-next-line no-unreachable-loop -- Exercise a single loop initializer.
  for (let { data: { at, length } = (effects.push('default'), [5, 8]) } = {}; ;) {
    assert.same(at.call([2, 6], -1) + length, 8);
    break;
  }
  assert.deepEqual(effects, ['assignment', 'default']);
});

QUnit.test('nested leaf twins retain an earlier claimed realm static', assert => {
  const { Array: { from, name } } = globalThis;
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.same(typeof name, 'string');
});

QUnit.test('nested leaf twins fold a default before the kept nested binding', assert => {
  const effects = [];
  const rows = [4, 9];
  rows.other = { get value() {
    effects.push('kept');
    return 3;
  } };
  const source = { get data() {
    effects.push('hop');
    return undefined;
  } };
  const { data: { other: { value }, at } = (effects.push('default'), rows) } = source;
  assert.same(value, 3);
  assert.same(at.call(rows, -1), 9);
  assert.deepEqual(effects, ['hop', 'default', 'kept']);
});

QUnit.test('nested leaf twins share a computed root with the earlier claim', assert => {
  const effects = [];
  const rows = [4, 9];
  rows.other = { get value() {
    effects.push('kept');
    return 3;
  } };
  const source = {
    get includes() {
      effects.push('claim');
      return function () { return this === source; };
    },
    get data() { effects.push('hop'); return rows; },
  };
  function make() {
    effects.push('root');
    return source;
  }
  const { includes, data: { at, other: { value } } } = make();
  assert.same(includes.call(source), true);
  assert.same(value, 3);
  assert.same(at.call(rows, -1), 9);
  assert.deepEqual(effects, ['root', 'claim', 'hop', 'kept']);
});
