// Reflect methods
QUnit.test('Reflect.apply', assert => {
  assert.same(Reflect.apply(Math.floor, undefined, [1.75]), 1);
});

QUnit.test('Reflect.construct', assert => {
  function Foo(x) { this.x = x; }
  const obj = Reflect.construct(Foo, [42]);
  assert.same(obj.x, 42);
  assert.true(obj instanceof Foo);
});

QUnit.test('Reflect.defineProperty', assert => {
  const obj = {};
  assert.true(Reflect.defineProperty(obj, 'x', { value: 1 }));
  assert.same(obj.x, 1);
});

QUnit.test('Reflect.deleteProperty', assert => {
  const obj = { x: 1 };
  assert.true(Reflect.deleteProperty(obj, 'x'));
  assert.false('x' in obj);
});

QUnit.test('Reflect.get / Reflect.set', assert => {
  const obj = { x: 1 };
  assert.same(Reflect.get(obj, 'x'), 1);
  Reflect.set(obj, 'x', 2);
  assert.same(obj.x, 2);
});

QUnit.test('Reflect.has', assert => {
  assert.true(Reflect.has({ x: 1 }, 'x'));
  assert.false(Reflect.has({ x: 1 }, 'y'));
});

QUnit.test('Reflect.getPrototypeOf / setPrototypeOf', assert => {
  const proto = { type: 'custom' };
  const obj = {};
  Reflect.setPrototypeOf(obj, proto);
  assert.same(Reflect.getPrototypeOf(obj), proto);
});

QUnit.test('Reflect.isExtensible / preventExtensions', assert => {
  const obj = {};
  assert.true(Reflect.isExtensible(obj));
  Reflect.preventExtensions(obj);
  assert.false(Reflect.isExtensible(obj));
});

QUnit.test('Reflect.getOwnPropertyDescriptor', assert => {
  const obj = { x: 42 };
  const desc = Reflect.getOwnPropertyDescriptor(obj, 'x');
  assert.same(desc.value, 42);
  assert.true(desc.writable);
});

QUnit.test('Reflect.ownKeys', assert => {
  const s = Symbol('s');
  const obj = { a: 1, [s]: 2 };
  const keys = Reflect.ownKeys(obj);
  assert.true(keys.includes('a'));
  assert.true(keys.includes(s));
});
