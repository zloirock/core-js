import { STRICT } from '../helpers/constants';

QUnit.test('Array#reverse', assert => {
  const { reverse } = Array.prototype;
  assert.isFunction(reverse);
  assert.arity(reverse, 0);
  if ('name' in reverse) assert.name(reverse, 'reverse');
  assert.looksNative(reverse);
  assert.nonEnumerable(Array.prototype, 'reverse');
  const a = [1, 2.2, 3.3];
  function fn() {
    +a;
    a.reverse();
  }
  fn();
  assert.arrayEqual(a, [3.3, 2.2, 1]);
  if (STRICT) {
    assert.throws(() => reverse.call(null, () => { /* empty */ }, 1), TypeError);
    assert.throws(() => reverse.call(undefined, () => { /* empty */ }, 1), TypeError);
  }
});
