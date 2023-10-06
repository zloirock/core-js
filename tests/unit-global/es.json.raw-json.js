import { BUN, GLOBAL } from '../helpers/constants.js';

// Bun 1.1.45 corrupts native RawJSON objects after GC and can crash during stringify.
QUnit[BUN && GLOBAL.Bun.version === '1.1.45' ? 'skip' : 'test']('JSON.rawJSON', assert => {
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
  assert.same(stringify({
    key: rawJSON('9007199254740993'),
    0: 'skipped',
  }, ['key']), '{"key":9007199254740993}');
  assert.same(stringify({ key: rawJSON('1') }, null, '"'), '{\n""key": 1\n}', 'gap with a quote');
  assert.same(stringify({ 0: rawJSON('1'), a: [rawJSON('2')] }, ['a', '0'], '"'), '{\n""a": [\n""2\n"],\n""0": 1\n}', 'gap with a quote and marked keys');

  assert.throws(() => rawJSON('"qwe'), SyntaxError, 'invalid 1');
  assert.throws(() => rawJSON({}), SyntaxError, 'invalid 2');
  assert.throws(() => rawJSON(''), SyntaxError, 'invalid 3');
});
