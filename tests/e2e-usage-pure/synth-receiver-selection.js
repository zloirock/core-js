// Supplied arguments and parameter defaults keep their own scopes and effect order.
QUnit.test('synth receiver: the caller is outside the default parameter frame', assert => {
  // eslint-disable-next-line default-param-last -- The later parameter deliberately shadows the default's global.
  const value = (({ from } = Array, Array) => from([1, 2]))(globalThis.Array);
  assert.deepEqual(value, [1, 2]);
});

QUnit.test('synth receiver: sequence prefixes and the live default run once', assert => {
  let log = '';
  const supplied = (({ from } = (log += 'default;', Array)) => from([3]))((log += 'argument;', Array));
  assert.deepEqual(supplied, [3]);
  assert.same(log, 'argument;');
  // eslint-disable-next-line no-void -- The effectful argument must still trigger the parameter default.
  const omitted = (({ of } = (log += 'fallback;', Array)) => of(4))(void (log += 'undefined;'));
  assert.deepEqual(omitted, [4]);
  assert.same(log, 'argument;undefined;fallback;');
});

QUnit.test('synth receiver: supplied properties still override the default', assert => {
  function read({ from } = Array) { return from([5]); }
  assert.deepEqual(read({ from: value => ['custom', value[0]] }), ['custom', 5]);
  assert.deepEqual(read(), [5]);
});

QUnit.test('synth reads the operand selected by a nullish receiver', assert => {
  const events = [];
  const rows = [5, 7];
  // eslint-disable-next-line no-constant-binary-expression -- the null operand must keep its effects before selecting the right
  function read({ box: { marker = -1, at } } = { box: (events.push('left'), null) ?? (events.push('right'), rows) }) {
    return [marker, at.call(rows, -1)];
  }
  assert.deepEqual(read(), [-1, 7]);
  assert.deepEqual(events, ['left', 'right']);
  assert.deepEqual(read({ box: { marker: 3, at() { return this[0]; } } }), [3, 5]);
  assert.deepEqual(events, ['left', 'right']);
});

QUnit.test('a synthesized parameter preserves its argument identity for arguments', assert => {
  function make() { return Map; }
  const observed = (function ({ groupBy }) {
    // eslint-disable-next-line prefer-rest-params -- the identity visible through the arguments object is under test
    return [typeof groupBy, arguments[0] === Map];
  })(make());
  assert.deepEqual(observed, ['function', true]);
});
