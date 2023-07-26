import { createIterator, nativeSubclass } from '../helpers/helpers';

const { getPrototypeOf } = Object;

QUnit.test('Iterator', assert => {
  assert.isFunction(Iterator);
  assert.arity(Iterator, 0);
  assert.name(Iterator, 'Iterator');
  assert.looksNative(Iterator);

  const generator = (() => {
    try {
      return Function('return function*(){}()')();
    } catch { /* empty */ }
  })();

  if (generator) {
    const proto = getPrototypeOf(getPrototypeOf(getPrototypeOf(generator)));
    if (proto !== Object.prototype && proto !== null) {
      assert.true(generator instanceof Iterator, 'Generator');
    }
  }

  assert.true(''[Symbol.iterator]() instanceof Iterator, 'String Iterator');
  assert.true([].values() instanceof Iterator, 'Array Iterator');
  assert.true(new Set().values() instanceof Iterator, 'Set Iterator');
  assert.true('abc'.matchAll(/./g) instanceof Iterator, 'MatchAll Iterator');
  assert.true(Iterator.from(createIterator([1, 2, 3])) instanceof Iterator, 'From Proxy');
  assert.true([].values().drop(1) instanceof Iterator, 'Drop Proxy');

  if (nativeSubclass) {
    const Sub = nativeSubclass(Iterator);
    assert.true(new Sub() instanceof Iterator, 'abstract constructor');
  }

  assert.throws(() => new Iterator(), 'direct constructor throws');
  assert.throws(() => Iterator(), 'throws w/o `new`');
});

QUnit.test('Iterator#constructor', assert => {
  assert.same(Iterator.prototype.constructor, Iterator, 'Iterator#constructor is Iterator');
});

QUnit.test('Iterator#@@toStringTag', assert => {
  assert.same(Iterator.prototype[Symbol.toStringTag], 'Iterator', 'Iterator::@@toStringTag is `Iterator`');
  assert.same(String(Iterator.from({
    next: () => ({ done: Math.random() > 0.9, value: Math.random() * 10 | 0 }),
  })), '[object Iterator]', 'correct stringification');
});
