import { STRICT } from '../helpers/constants';

QUnit.test('Array#item', assert => {
  const { item } = Array.prototype;
  assert.isFunction(item);
  assert.arity(item, 1);
  assert.name(item, 'item');
  assert.looksNative(item);
  assert.nonEnumerable(Array.prototype, 'item');
  assert.same(1, [1, 2, 3].item(0));
  assert.same(2, [1, 2, 3].item(1));
  assert.same(3, [1, 2, 3].item(2));
  assert.same(undefined, [1, 2, 3].item(3));
  assert.same(3, [1, 2, 3].item(-1));
  assert.same(2, [1, 2, 3].item(-2));
  assert.same(1, [1, 2, 3].item(-3));
  assert.same(undefined, [1, 2, 3].item(-4));
  assert.same(1, [1, 2, 3].item(0.4));
  assert.same(1, [1, 2, 3].item(0.5));
  assert.same(1, [1, 2, 3].item(0.6));
  assert.same(1, [1].item(NaN));
  assert.same(1, [1].item());
  assert.same(1, [1, 2, 3].item(-0));
  assert.same(undefined, Array(1).item(0));
  assert.same(1, item.call({ 0: 1, length: 1 }, 0));
  if (STRICT) {
    assert.throws(() => item.call(null, 0), TypeError);
    assert.throws(() => item.call(undefined, 0), TypeError);
  }
});
