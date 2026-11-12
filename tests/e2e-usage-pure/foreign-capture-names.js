// A previous lowering's temporary is still source, not a polyfilled receiver.
// eslint-disable-next-line no-var, no-underscore-dangle -- Reproduce a foreign lowerer's temporary.
var _ref;
_ref = [3, 7];
const last = _ref.at(-1);
const { includes } = _ref;

QUnit.test('foreign capture names retain their claims', assert => {
  assert.same(last, 7);
  assert.true(includes.call(_ref, 3));
});

QUnit.test('parameter overwrites retain key order and both statics', assert => {
  const effects = [];
  // eslint-disable-next-line es/no-nonstandard-array-properties -- The missing slot still evaluates its key.
  function read([{ of, from, [(effects.push('key'), 'key')]: other } = Array]) {
    return [of(4)[0], from([9])[0], other];
  }
  assert.deepEqual(read([undefined]), [4, 9, undefined]);
  assert.deepEqual(effects, ['key']);
});
