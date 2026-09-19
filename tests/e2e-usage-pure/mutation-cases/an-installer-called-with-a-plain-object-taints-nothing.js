
// ... and the negative that pins the pairing: a call handing the installer a plain object taints
// no built-in, so a sibling read keeps its substitution - asserted through a POLYFILLED result,
// which is what a stripped realm can answer at all
QUnit.test('mutated-statics: an installer called with a plain object taints nothing', assert => {
  function install(target) {
    target.from = function patched() { return 'NOT-A-BUILTIN'; };
  }
  const box = { from: null };
  install(box);
  assert.same(box.from(), 'NOT-A-BUILTIN');
  // the sibling is an INSTANCE dispatch, and its receiver's own name is untouched by every patch
  // in this file - a static patch of a sibling key would not deopt it, and the stripped realm
  // answers it only through the polyfill
  assert.same([1, 2, 3].at(-1), 3);
});
