import { createIterator } from '../helpers/helpers';

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

  if (generator) assert.ok(generator instanceof Iterator, 'Generator');

  assert.ok(''[Symbol.iterator]() instanceof Iterator, 'String Iterator');
  assert.ok([].values() instanceof Iterator, 'Array Iterator');
  assert.ok(new Set().values() instanceof Iterator, 'Set Iterator');
  assert.ok('abc'.matchAll(/./g) instanceof Iterator, 'MatchAll Iterator');
  assert.ok(Iterator.from(createIterator([1, 2, 3])) instanceof Iterator, 'From Proxy');
  assert.ok([].values().drop(1) instanceof Iterator, 'Drop Proxy');

  assert.ok(new Iterator() instanceof Iterator, 'constructor');
  assert.throws(() => Iterator(), 'throws w/o `new`');
});

QUnit.test('Iterator#constructor', assert => {
  assert.strictEqual(Iterator.prototype.constructor, Iterator, 'Iterator#constructor is Iterator');
});

QUnit.test('Iterator#@@toStringTag', assert => {
  assert.strictEqual(Iterator.prototype[Symbol.toStringTag], 'Iterator', 'Iterator::@@toStringTag is `Iterator`');
  assert.strictEqual(String(Iterator.from({
    next: () => ({ done: Math.random() > 0.9, value: Math.random() * 10 | 0 }),
  })), '[object Iterator]', 'correct stringification');
});
