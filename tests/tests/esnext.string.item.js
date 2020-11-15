import { STRICT } from '../helpers/constants';

QUnit.test('String#item', assert => {
  const { item } = String.prototype;
  assert.isFunction(item);
  assert.arity(item, 1);
  assert.name(item, 'item');
  assert.looksNative(item);
  assert.nonEnumerable(String.prototype, 'item');
  assert.same('1', '123'.item(0));
  assert.same('2', '123'.item(1));
  assert.same('3', '123'.item(2));
  assert.same(undefined, '123'.item(3));
  assert.same('3', '123'.item(-1));
  assert.same('2', '123'.item(-2));
  assert.same('1', '123'.item(-3));
  assert.same(undefined, '123'.item(-4));
  assert.same('1', '123'.item(0.4));
  assert.same('1', '123'.item(0.5));
  assert.same('1', '123'.item(0.6));
  assert.same('1', '1'.item(NaN));
  assert.same('1', '1'.item());
  assert.same('1', '123'.item(-0));
  assert.same('1', item.call({ toString() { return '123'; } }, 0));
  if (STRICT) {
    assert.throws(() => item.call(null, 0), TypeError);
    assert.throws(() => item.call(undefined, 0), TypeError);
  }
});
