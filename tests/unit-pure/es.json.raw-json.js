import rawJSON from '@core-js/pure/es/json/raw-json';
import stringify from '@core-js/pure/es/json/stringify';
import defineProperty from '@core-js/pure/es/object/define-property';
import isFrozen from '@core-js/pure/es/object/is-frozen';
import hasOwn from '@core-js/pure/es/object/has-own';

QUnit.test('JSON.rawJSON', assert => {
  assert.isFunction(rawJSON);
  assert.arity(rawJSON, 1);
  assert.name(rawJSON, 'rawJSON');

  // Raw values can first appear during serialization; callbacks must not be replayed.
  let calls = 0;
  assert.same(stringify({
    toJSON() {
      calls += 1;
      return rawJSON('1');
    },
  }), '1', 'created in toJSON');
  assert.same(calls, 1, 'toJSON called once');

  {
    calls = 0;
    assert.same(stringify(defineProperty({}, 'a', {
      enumerable: true,
      get() {
        calls += 1;
        return rawJSON('1');
      },
    })), '{"a":1}', 'created in getter');
    assert.same(calls, 1, 'getter called once');
  }

  calls = 0;
  assert.same(stringify({ a: 0 }, (key, value) => {
    calls += 1;
    return key === 'a' ? rawJSON('1') : value;
  }), '{"a":1}', 'created in replacer');
  assert.same(calls, 2, 'replacer called once per property');

  const input = { a: 0 };
  const space = new Number(2);
  calls = 0;
  space.valueOf = () => {
    calls += 1;
    input.a = rawJSON('1');
    return 2;
  };
  assert.same(stringify(input, null, space), '{\n  "a": 1\n}', 'created during space conversion');
  assert.same(calls, 1, 'space converted once');

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
  assert.throws(() => rawJSON('01'), SyntaxError, 'leading zero');
  assert.throws(() => rawJSON('-01'), SyntaxError, 'negative leading zero');
  assert.throws(() => rawJSON('00'), SyntaxError, 'multiple zeros');
  assert.same(rawJSON('0.1').rawJSON, '0.1', 'fraction with a leading zero');
});
