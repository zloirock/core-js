// a call whose callee is not yet initialized where it stands throws before the function runs, so
// the static the function would patch keeps its polyfill: a realm without it still answers
QUnit.test('mutation call channel: a call before its callee initializes patches nothing', assert => {
  try {
    early.call(Math);
  } catch { /* the callee is still undefined */ }
  // eslint-disable-next-line no-var, no-useless-assignment, unicorn/consistent-function-style -- the hoisted, not yet initialized binding is the case under test
  var early = function () { this.clz32 = () => 'PATCHED'; };
  assert.same(Math.clz32(1), 31);
});
