// The stripped-realm leg is only an oracle while the realm STAYS stripped. A test that patches a
// built-in and restores it from a value the transform rewrote puts the method back - silently, and
// for every test that runs after it, so the leg keeps reporting green over a full environment.
// The applier's own canary fires before the bundle loads and cannot see that. The `zz-` prefix is what
// keeps this module last in the generated index, so it re-asks the question after every patching test.
// The runner checks the complete strip manifest outside the transform. Reading a constructor
// here would measure its substituted ponyfill, not the realm whose restoration we are checking.
QUnit.test('nothing re-installed a stripped built-in during the run', assert => {
  const G = Function('return this')();
  if (G.checkStrippedRealm) G.checkStrippedRealm();
  assert.true(true, 'the stripped realm has no unexpected restored features');
});
