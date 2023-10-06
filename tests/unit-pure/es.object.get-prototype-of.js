import create from 'core-js-pure/es/object/create';
import getPrototypeOf from 'core-js-pure/es/object/get-prototype-of';

QUnit.test('Object.getPrototypeOf', assert => {
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  assert.same(getPrototypeOf({}), Object.prototype);
  assert.same(getPrototypeOf([]), Array.prototype);
  function F() { /* empty */ }
  assert.same(getPrototypeOf(new F()), F.prototype);
  const object = { q: 1 };
  assert.same(getPrototypeOf(create(object)), object);
  assert.same(getPrototypeOf(create(null)), null);
  assert.same(getPrototypeOf(getPrototypeOf({})), null);
  function Foo() { /* empty */ }
  Foo.prototype.foo = 'foo';
  function Bar() { /* empty */ }
  Bar.prototype = create(Foo.prototype);
  Bar.prototype.constructor = Bar;
  assert.same(getPrototypeOf(Bar.prototype).foo, 'foo');
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.notThrows(() => getPrototypeOf(value), `accept ${ typeof value }`);
  }
  assert.throws(() => getPrototypeOf(null), TypeError, 'throws on null');
  assert.throws(() => getPrototypeOf(undefined), TypeError, 'throws on undefined');
  assert.same(getPrototypeOf('foo'), String.prototype);
});
