/* eslint-disable no-self-compare */
import compositeSymbol from 'core-js-pure/features/composite-symbol';
import Symbol from 'core-js-pure/features/symbol';

QUnit.test('compositeSymbol', assert => {
  assert.isFunction(compositeSymbol);
  if (compositeSymbol.name) assert.name(compositeSymbol, 'compositeSymbol');

  assert.ok(Object(compositeSymbol({})) instanceof Symbol);

  const a = ['a'];
  const b = ['b'];
  const c = ['c'];

  assert.ok(compositeSymbol(a) === compositeSymbol(a));
  assert.ok(compositeSymbol(a) !== compositeSymbol(['a']));
  assert.ok(compositeSymbol(a) !== compositeSymbol(a, 1));
  assert.ok(compositeSymbol(a) !== compositeSymbol(a, b));
  assert.ok(compositeSymbol(a, 1) === compositeSymbol(a, 1));
  assert.ok(compositeSymbol(a, b) === compositeSymbol(a, b));
  assert.ok(compositeSymbol(a, b) !== compositeSymbol(b, a));
  assert.ok(compositeSymbol(a, b, c) === compositeSymbol(a, b, c));
  assert.ok(compositeSymbol(a, b, c) !== compositeSymbol(c, b, a));
  assert.ok(compositeSymbol(a, b, c) !== compositeSymbol(a, c, b));
  assert.ok(compositeSymbol(a, b, c, 1) !== compositeSymbol(a, b, c));
  assert.ok(compositeSymbol(a, b, c, 1) === compositeSymbol(a, b, c, 1));
  assert.ok(compositeSymbol(1, a) === compositeSymbol(1, a));
  assert.ok(compositeSymbol(1, a) !== compositeSymbol(a, 1));
  assert.ok(compositeSymbol(1, a, 2, b) === compositeSymbol(1, a, 2, b));
  assert.ok(compositeSymbol(1, a, 2, b) !== compositeSymbol(1, a, b, 2));
  assert.ok(compositeSymbol(1, 2, a, b) === compositeSymbol(1, 2, a, b));
  assert.ok(compositeSymbol(1, 2, a, b) !== compositeSymbol(1, a, b, 2));
  assert.ok(compositeSymbol(a, a) === compositeSymbol(a, a));
  assert.ok(compositeSymbol(a, a) !== compositeSymbol(a, ['a']));
  assert.ok(compositeSymbol(a, a) !== compositeSymbol(a, b));

  assert.throws(() => compositeSymbol(), TypeError);
  assert.throws(() => compositeSymbol(1, 2), TypeError);
  assert.throws(() => compositeSymbol('foo', null, true), TypeError);
});
