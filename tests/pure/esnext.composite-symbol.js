
import compositeSymbol from 'core-js-pure/features/composite-symbol';
import Symbol from 'core-js-pure/features/symbol';

QUnit.test('compositeSymbol', assert => {
  assert.isFunction(compositeSymbol);
  if (compositeSymbol.name) assert.name(compositeSymbol, 'compositeSymbol');

  assert.ok(Object(compositeSymbol({})) instanceof Symbol);

  const a = ['a'];
  const b = ['b'];
  const c = ['c'];

  assert.same(compositeSymbol(a), compositeSymbol(a));
  assert.notStrictEqual(compositeSymbol(a), compositeSymbol(['a']));
  assert.notStrictEqual(compositeSymbol(a), compositeSymbol(a, 1));
  assert.notStrictEqual(compositeSymbol(a), compositeSymbol(a, b));
  assert.same(compositeSymbol(a, 1), compositeSymbol(a, 1));
  assert.same(compositeSymbol(a, b), compositeSymbol(a, b));
  assert.notStrictEqual(compositeSymbol(a, b), compositeSymbol(b, a));
  assert.same(compositeSymbol(a, b, c), compositeSymbol(a, b, c));
  assert.notStrictEqual(compositeSymbol(a, b, c), compositeSymbol(c, b, a));
  assert.notStrictEqual(compositeSymbol(a, b, c), compositeSymbol(a, c, b));
  assert.notStrictEqual(compositeSymbol(a, b, c, 1), compositeSymbol(a, b, c));
  assert.same(compositeSymbol(a, b, c, 1), compositeSymbol(a, b, c, 1));
  assert.same(compositeSymbol(1, a), compositeSymbol(1, a));
  assert.notStrictEqual(compositeSymbol(1, a), compositeSymbol(a, 1));
  assert.same(compositeSymbol(1, a, 2, b), compositeSymbol(1, a, 2, b));
  assert.notStrictEqual(compositeSymbol(1, a, 2, b), compositeSymbol(1, a, b, 2));
  assert.same(compositeSymbol(1, 2, a, b), compositeSymbol(1, 2, a, b));
  assert.notStrictEqual(compositeSymbol(1, 2, a, b), compositeSymbol(1, a, b, 2));
  assert.same(compositeSymbol(a, a), compositeSymbol(a, a));
  assert.notStrictEqual(compositeSymbol(a, a), compositeSymbol(a, ['a']));
  assert.notStrictEqual(compositeSymbol(a, a), compositeSymbol(a, b));
  assert.same(compositeSymbol(), compositeSymbol());
  assert.same(compositeSymbol(1, 2), compositeSymbol(1, 2));
  assert.notStrictEqual(compositeSymbol(1, 2), compositeSymbol(2, 1));
  assert.same(compositeSymbol('foo', null, true), compositeSymbol('foo', null, true));
  assert.same(compositeSymbol('string'), Symbol.for('string'));
});
