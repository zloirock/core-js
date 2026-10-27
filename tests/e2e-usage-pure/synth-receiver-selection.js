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
