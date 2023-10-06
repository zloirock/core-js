QUnit.test('JSON.rawJSON', assert => {
  const { rawJSON, stringify } = JSON;
  const { isFrozen, hasOwn } = Object;

  assert.isFunction(rawJSON);
  assert.arity(rawJSON, 1);
  assert.name(rawJSON, 'rawJSON');
  assert.looksNative(rawJSON);

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
