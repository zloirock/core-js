import Symbol from 'core-js-pure/es/symbol';
import stringify from 'core-js-pure/es/json/stringify';

QUnit.test('Symbols & JSON.stringify', assert => {
  assert.strictEqual(stringify([
    1,
    Symbol('foo'),
    false,
    Symbol('bar'),
    {},
  ]), '[1,null,false,null,{}]', 'array value');
  assert.strictEqual(stringify({
    symbol: Symbol('symbol'),
  }), '{}', 'object value');
  const object = { bar: 2 };
  object[Symbol('symbol')] = 1;
  assert.strictEqual(stringify(object), '{"bar":2}', 'object key');
  assert.strictEqual(stringify(Symbol('symbol')), undefined, 'symbol value');
  if (typeof Symbol() === 'symbol') {
    assert.strictEqual(stringify(Object(Symbol('symbol'))), '{}', 'boxed symbol');
  }
  assert.strictEqual(stringify(undefined, () => 42), '42', 'replacer works with top-level undefined');
});

QUnit.test('Well‑formed JSON.stringify', assert => {
  assert.isFunction(stringify);
  assert.arity(stringify, 3);
  assert.name(stringify, 'stringify');

  assert.same(stringify({ foo: 'bar' }), '{"foo":"bar"}', 'basic');
  assert.same(stringify('\uDEAD'), '"\\udead"', 'r1');
  assert.same(stringify('\uDF06\uD834'), '"\\udf06\\ud834"', 'r2');
  assert.same(stringify('\uDF06ab\uD834'), '"\\udf06ab\\ud834"', 'r3');
  assert.same(stringify('𠮷'), '"𠮷"', 'r4');
  assert.same(stringify('\uD834\uDF06'), '"𝌆"', 'r5');
  assert.same(stringify('\uD834\uD834\uDF06'), '"\\ud834𝌆"', 'r6');
  assert.same(stringify('\uD834\uDF06\uDF06'), '"𝌆\\udf06"', 'r7');
  assert.same(stringify({ '𠮷': ['\uDF06\uD834'] }), '{"𠮷":["\\udf06\\ud834"]}', 'r8');
});
