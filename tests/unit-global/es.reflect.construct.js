import { PROTO } from '../helpers/constants.js';

QUnit.test('Reflect.construct', assert => {
  const { construct } = Reflect;
  const { getPrototypeOf } = Object;
  assert.isFunction(construct);
  assert.arity(construct, 2);
  assert.name(construct, 'construct');
  assert.looksNative(construct);
  assert.nonEnumerable(Reflect, 'construct');
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
  assert.notThrows(() => getPrototypeOf(construct(B, [])) === Object.prototype);
  assert.notThrows(() => typeof construct(Date, []).getTime() == 'number', 'works with native constructors with 2 arguments');
  // eslint-disable-next-line prefer-arrow-callback -- testing
  assert.throws(() => construct(function () { /* empty */ }), TypeError, 'throws when the second argument is not an object');
});

if (PROTO) QUnit.test('Reflect.construct, transpiled built-in subclasses', assert => {
  class SubArray extends Array {
    static create() {
      return super.of?.(10, 20, 30);
    }
  }
  class DerivedArray extends SubArray { /* empty */ }
  for (const Constructor of [SubArray, DerivedArray]) {
    const array = new Constructor(3);
    assert.true(Array.isArray(array), 'new: Array brand');
    assert.true(array instanceof Constructor, 'new: subclass instance');
    assert.same(Object.getPrototypeOf(array), Constructor.prototype, 'new: subclass prototype');
    assert.same(array.length, 3, 'new: length');
    const fromSuper = Constructor.create();
    assert.true(Array.isArray(fromSuper), 'super.of: Array brand');
    assert.true(fromSuper instanceof Constructor, 'super.of: subclass instance');
    assert.same(Object.getPrototypeOf(fromSuper), Constructor.prototype, 'super.of: subclass prototype');
    assert.arrayEqual(fromSuper, [10, 20, 30], 'super.of: elements');
  }
  class SubBoolean extends Boolean { /* empty */ }
  const boolean = new SubBoolean(true);
  assert.true(boolean instanceof SubBoolean, 'Boolean: subclass instance');
  assert.same(Object.getPrototypeOf(boolean), SubBoolean.prototype, 'Boolean: subclass prototype');
  assert.true(Boolean.prototype.valueOf.call(boolean), 'Boolean: internal slot');
});

QUnit.test('Reflect.construct, built-in targets', assert => {
  const { construct } = Reflect;
  const { getPrototypeOf } = Object;
  const boolean = construct(Boolean, [true]);
  assert.same(Boolean.prototype.valueOf.call(boolean), true, 'Boolean internal slot');
  assert.same(getPrototypeOf(boolean), Boolean.prototype, 'Boolean default prototype');
  const array = construct(Array, [3]);
  assert.true(Array.isArray(array), 'Array internal slot');
  assert.same(array.length, 3, 'Array length');
  assert.same(getPrototypeOf(array), Array.prototype, 'Array default prototype');
  function F() { /* empty */ }
  const booleanWithNewTarget = construct(Boolean, [true], F);
  assert.true(booleanWithNewTarget instanceof F, 'Boolean with newTarget');
  assert.same(getPrototypeOf(booleanWithNewTarget), F.prototype, 'Boolean newTarget prototype');
  if (!construct.sham) {
    assert.same(Boolean.prototype.valueOf.call(booleanWithNewTarget), true, 'Boolean internal slot with newTarget');
    const arrayWithNewTarget = construct(Array, [3], F);
    assert.true(Array.isArray(arrayWithNewTarget), 'Array internal slot with newTarget');
    assert.same(arrayWithNewTarget.length, 3, 'Array length with newTarget');
    assert.true(arrayWithNewTarget instanceof F, 'Array with newTarget');
    assert.same(getPrototypeOf(arrayWithNewTarget), F.prototype, 'Array newTarget prototype');
  }
});

