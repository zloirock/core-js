/* eslint-disable prefer-const -- The assignment-pattern host is under test. */
QUnit.test('destructuring: a global default after an effectful prefix is already served', assert => {
  const effects = [];
  function fallback() {
    effects.push('default');
    return null;
  }
  const { AggregateError: C = fallback(), other } = (effects.push('init'), globalThis);
  const error = new C([7], 'message');
  assert.same(error.message, 'message', 'the constructor is polyfilled');
  assert.deepEqual(error.errors, [7], 'the constructor received its arguments');
  assert.deepEqual(effects, ['init'], 'the live prefix runs once and the dead default never runs');
  assert.same(other, undefined, 'the unrelated residual remains native');
});

QUnit.test('destructuring: a generated literal capture keeps its own slot', assert => {
  const effects = [];
  let from, at;
  ({ C: { from }, values: { at } } = { C: { from: 3 }, values: (effects.push('slot'), [7]) });
  assert.same(from, 3, 'the native residual keeps its slot');
  assert.same(at.call([7], 0), 7, 'the instance claim reads the captured array');
  assert.deepEqual(effects, ['slot'], 'the captured slot is evaluated once');
});

QUnit.test('a present outer slot skips a selecting default before a missing nested receiver', assert => {
  let defaults = 0;
  function read(flag) {
    const { Map: { Map: { groupBy } } = (++defaults, flag ? globalThis : {}) } = globalThis;
    return groupBy;
  }
  assert.throws(() => read(true), TypeError);
  assert.same(defaults, 0);
});
