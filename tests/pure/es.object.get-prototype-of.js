import { create, getPrototypeOf } from 'core-js-pure/fn/object';

QUnit.test('Object.getPrototypeOf', assert => {
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  assert.ok(getPrototypeOf({}) === Object.prototype);
  assert.ok(getPrototypeOf([]) === Array.prototype);
  function F() { /* empty */ }
  assert.ok(getPrototypeOf(new F()) === F.prototype);
  const object = { q: 1 };
  assert.ok(getPrototypeOf(create(object)) === object);
  assert.ok(getPrototypeOf(create(null)) === null);
  assert.ok(getPrototypeOf(getPrototypeOf({})) === null);
  function Foo() { /* empty */ }
  Foo.prototype.foo = 'foo';
  function Bar() { /* empty */ }
  Bar.prototype = create(Foo.prototype);
  Bar.prototype.constructor = Bar;
  assert.strictEqual(getPrototypeOf(Bar.prototype).foo, 'foo');
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.notThrows(() => getPrototypeOf(value), `accept ${ typeof value }`);
  }
  assert.throws(() => getPrototypeOf(null), TypeError, 'throws on null');
  assert.throws(() => getPrototypeOf(undefined), TypeError, 'throws on undefined');
  assert.strictEqual(getPrototypeOf('foo'), String.prototype);
});
