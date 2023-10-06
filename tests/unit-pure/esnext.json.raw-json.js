import rawJSON from 'core-js-pure/actual/json/raw-json';
import stringify from 'core-js-pure/actual/json/stringify';
import isFrozen from 'core-js-pure/es/object/is-frozen';
import hasOwn from 'core-js-pure/es/object/has-own';

QUnit.test('JSON.rawJSON', assert => {
  assert.isFunction(rawJSON);
  assert.arity(rawJSON, 1);
  assert.name(rawJSON, 'rawJSON');

  const raw = rawJSON(1);
  assert.true(hasOwn(raw, 'rawJSON'), 'own rawJSON');
  assert.same(raw.rawJSON, '1', 'is string 1');
  assert.true(isFrozen(raw), 'frozen');

  assert.same(stringify(rawJSON('"qwe"')), '"qwe"');
  assert.same(stringify(rawJSON('null')), 'null');
  assert.same(stringify(rawJSON('true')), 'true');
  assert.same(stringify(rawJSON('9007199254740993')), '9007199254740993');
  assert.same(stringify({ key: rawJSON('9007199254740993') }), '{"key":9007199254740993}');
  assert.same(stringify([rawJSON('9007199254740993')]), '[9007199254740993]');

  assert.throws(() => rawJSON('"qwe'), SyntaxError, 'invalid 1');
  assert.throws(() => rawJSON({}), SyntaxError, 'invalid 2');
  assert.throws(() => rawJSON(''), SyntaxError, 'invalid 3');
});
