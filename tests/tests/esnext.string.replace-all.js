import { STRICT } from '../helpers/constants';

QUnit.test('String#replaceAll', assert => {
  const { replaceAll } = String.prototype;
  assert.isFunction(replaceAll);
  assert.arity(replaceAll, 2);
  assert.name(replaceAll, 'replaceAll');
  assert.looksNative(replaceAll);
  assert.nonEnumerable(String.prototype, 'replaceAll');
  assert.same('q=query+string+parameters'.replaceAll('+', ' '), 'q=query string parameters');
  assert.same('foo'.replaceAll('o', {}), 'f[object Object][object Object]');
  assert.same('[object Object]x[object Object]'.replaceAll({}, 'y'), 'yxy');
  assert.same(replaceAll.call({}, 'bject', 'lolo'), '[ololo Ololo]');
  if (STRICT) {
    assert.throws(() => replaceAll.call(null, 'a', 'b'), TypeError);
    assert.throws(() => replaceAll.call(undefined, 'a', 'b'), TypeError);
  }
  assert.same('b.b.b.b.b'.replaceAll(/\./, 'a'), 'babababab');
  assert.same('b.b.b.b.b'.replaceAll(/\./g, 'a'), 'babababab');
  const object = {};
  assert.same('[object Object]'.replaceAll(object, 'a'), 'a');
});
