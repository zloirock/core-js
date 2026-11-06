import construct from 'core-js-pure/es/reflect/construct';
import getPrototypeOf from 'core-js-pure/es/object/get-prototype-of';
import isArray from 'core-js-pure/es/array/is-array';

QUnit.test('Reflect.construct', assert => {
  assert.isFunction(construct);
  assert.arity(construct, 2);
  if ('name' in construct) {
    assert.name(construct, 'construct');
  }
  function A(a, b, c) {
    this.qux = a + b + c;
  }
  assert.same(construct(A, ['foo', 'bar', 'baz']).qux, 'foobarbaz', 'basic');
  A.apply = 42;
  assert.same(construct(A, ['foo', 'bar', 'baz']).qux, 'foobarbaz', 'works with redefined apply');
  const instance = construct(function () {
    this.x = 42;
  }, [], Array);
  assert.same(instance.x, 42, 'constructor with newTarget');
  assert.true(instance instanceof Array, 'prototype with newTarget');
  assert.throws(() => construct(42, []), TypeError, 'throws on primitive');
  function B() { /* empty */ }
  B.prototype = 42;
  assert.returns(() => getPrototypeOf(construct(B, [])), Object.prototype);
  assert.returns(() => typeof construct(Date, []).getTime(), 'number', 'works with native constructors with 2 arguments');
  // eslint-disable-next-line prefer-arrow-callback -- testing
  assert.throws(() => construct(function () { /* empty */ }), TypeError, 'throws when the second argument is not an object');
});

QUnit.test('Reflect.construct, built-in targets', assert => {
  const boolean = construct(Boolean, [true]);
  assert.same(Boolean.prototype.valueOf.call(boolean), true, 'Boolean internal slot');
  assert.same(getPrototypeOf(boolean), Boolean.prototype, 'Boolean default prototype');
  const array = construct(Array, [3]);
  assert.true(isArray(array), 'Array internal slot');
  assert.same(array.length, 3, 'Array length');
  assert.same(getPrototypeOf(array), Array.prototype, 'Array default prototype');
  function F() { /* empty */ }
  const booleanWithNewTarget = construct(Boolean, [true], F);
  assert.true(booleanWithNewTarget instanceof F, 'Boolean with newTarget');
  assert.same(getPrototypeOf(booleanWithNewTarget), F.prototype, 'Boolean newTarget prototype');
  if (!construct.sham) {
    assert.same(Boolean.prototype.valueOf.call(booleanWithNewTarget), true, 'Boolean internal slot with newTarget');
    const arrayWithNewTarget = construct(Array, [3], F);
    assert.true(isArray(arrayWithNewTarget), 'Array internal slot with newTarget');
    assert.same(arrayWithNewTarget.length, 3, 'Array length with newTarget');
    assert.true(arrayWithNewTarget instanceof F, 'Array with newTarget');
    assert.same(getPrototypeOf(arrayWithNewTarget), F.prototype, 'Array newTarget prototype');
  }
});
