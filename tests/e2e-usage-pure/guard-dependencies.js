// Guard dependencies - Object.create/defineProperty have `guard: 'symbol/constructor'`
// This means they're injected even when not directly needed, if Symbol polyfill is required

QUnit.test('guard: Object.create', assert => {
  const obj = Object.create(null);
  assert.same(Object.getPrototypeOf(obj), null);
  obj.x = 1;
  assert.same(obj.x, 1);
});

QUnit.test('guard: Object.defineProperty', assert => {
  const obj = {};
  Object.defineProperty(obj, 'x', { value: 42, enumerable: true });
  assert.same(obj.x, 42);
  assert.deepEqual(Object.keys(obj), ['x']);
});

QUnit.test('guard: Object.defineProperties', assert => {
  const obj = Object.defineProperties({}, {
    a: { value: 1, enumerable: true },
    b: { value: 2, enumerable: true },
  });
  assert.same(obj.a, 1);
  assert.same(obj.b, 2);
});

QUnit.test('guard: Object.getOwnPropertyDescriptor', assert => {
  const desc = Object.getOwnPropertyDescriptor({ x: 1 }, 'x');
  assert.same(desc.value, 1);
  assert.true(desc.enumerable);
});

QUnit.test('guard: Object.getOwnPropertyNames', assert => {
  const names = Object.getOwnPropertyNames({ a: 1, b: 2 });
  assert.true(names.includes('a'));
  assert.true(names.includes('b'));
});
