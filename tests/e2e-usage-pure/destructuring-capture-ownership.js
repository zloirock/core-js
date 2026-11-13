import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('destructuring capture: an iterator leaf beside a static is served', assert => {
  let from, iterator;
  // eslint-disable-next-line prefer-const -- the assignment host is the tested shape
  ({ Array: { from, prototype: { [Symbol.iterator]: iterator } } } = globalThis);
  assert.deepEqual(from([7]), [7]);
  assert.same(iterator.call([8]).next().value, 8);
});

QUnit.test('destructuring capture: effectful element keys retain their method', assert => {
  const effects = [];
  function key() {
    effects.push('key');
    return 'at';
  }
  function * values() { yield [7, 8]; }
  const [{ [key()]: at }] = values();
  assert.same(at.call([7, 8], -1), 8);
  assert.deepEqual(effects, ['key']);
});

QUnit.test('destructuring capture: namespaces have no constructor prototype', assert => {
  assert.throws(() => {
    const { Math: { trunc, prototype: { [Symbol.iterator]: iterator } } } = globalThis;
    return [trunc, iterator];
  }, TypeError);
  function read({ JSON: { stringify, prototype: { [Symbol.iterator]: iterator } } } = globalThis) {
    return [stringify, iterator];
  }
  assert.throws(() => read(), TypeError);
});

QUnit.test('destructuring capture: a used assignment still rejects a nullish source', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    let of = 'unchanged';
    let result;
    let failure;
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining -- nullish coercion must still throw when its result is used
      result = { of } = globalThis.window?.Array;
    } catch (error) {
      failure = error;
    }
    if (present) {
      assert.same(failure, undefined);
      assert.same(result, Array);
      assert.deepEqual(of(7), [7]);
    } else {
      assert.true(failure instanceof TypeError);
      assert.same(of, 'unchanged');
      assert.same(result, undefined);
    }
  });
});
