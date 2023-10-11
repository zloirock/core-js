import Symbol from '@core-js/pure/es/symbol';
import compositeSymbol from '@core-js/pure/full/composite-symbol';

QUnit.test('compositeSymbol', assert => {
  assert.isFunction(compositeSymbol);
  if (compositeSymbol.name) assert.name(compositeSymbol, 'compositeSymbol');

  assert.true(Object(compositeSymbol({})) instanceof Symbol);

  const a = ['a'];
  const b = ['b'];
  const c = ['c'];

  assert.same(compositeSymbol(a), compositeSymbol(a));
  assert.notSame(compositeSymbol(a), compositeSymbol(['a']));
  assert.notSame(compositeSymbol(a), compositeSymbol(a, 1));
  assert.notSame(compositeSymbol(a), compositeSymbol(a, b));
  assert.same(compositeSymbol(a, 1), compositeSymbol(a, 1));
  assert.same(compositeSymbol(a, b), compositeSymbol(a, b));
  assert.notSame(compositeSymbol(a, b), compositeSymbol(b, a));
  assert.same(compositeSymbol(a, b, c), compositeSymbol(a, b, c));
  assert.notSame(compositeSymbol(a, b, c), compositeSymbol(c, b, a));
  assert.notSame(compositeSymbol(a, b, c), compositeSymbol(a, c, b));
  assert.notSame(compositeSymbol(a, b, c, 1), compositeSymbol(a, b, c));
  assert.same(compositeSymbol(a, b, c, 1), compositeSymbol(a, b, c, 1));
  assert.same(compositeSymbol(1, a), compositeSymbol(1, a));
  assert.notSame(compositeSymbol(1, a), compositeSymbol(a, 1));
  assert.same(compositeSymbol(1, a, 2, b), compositeSymbol(1, a, 2, b));
  assert.notSame(compositeSymbol(1, a, 2, b), compositeSymbol(1, a, b, 2));
  assert.same(compositeSymbol(1, 2, a, b), compositeSymbol(1, 2, a, b));
  assert.notSame(compositeSymbol(1, 2, a, b), compositeSymbol(1, a, b, 2));
  assert.same(compositeSymbol(a, a), compositeSymbol(a, a));
  assert.notSame(compositeSymbol(a, a), compositeSymbol(a, ['a']));
  assert.notSame(compositeSymbol(a, a), compositeSymbol(a, b));
  assert.same(compositeSymbol(), compositeSymbol());
  assert.same(compositeSymbol(1, 2), compositeSymbol(1, 2));
  assert.notSame(compositeSymbol(1, 2), compositeSymbol(2, 1));
  assert.same(compositeSymbol('foo', null, true), compositeSymbol('foo', null, true));
  assert.same(compositeSymbol('string'), Symbol.for('string'));
});
