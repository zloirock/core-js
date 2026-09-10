// The stripped-realm leg is only an oracle while the realm STAYS stripped. A test that patches a
// built-in and restores it from a value the transform rewrote puts the method back - silently, and
// for every test that runs after it, so the leg keeps reporting green over a full environment.
// The applier's own canary fires before the bundle loads and cannot see that. The `zz-` prefix is what
// keeps this module last in the generated index, so it re-asks the question after every patching test.
// Every read here goes through the realm global reached by `Function('return this')()` with
// assembled keys: a plain `Promise` / `Array` in this file is rewritten to a pure import, and the
// check would then measure the ponyfill instead of the realm - which is how the first draft of
// this very test came out vacuous.
QUnit.test('nothing re-installed a stripped built-in during the run', assert => {
  const G = Function('return this')();
  function key(parts) {
    return parts.join('');
  }
  const leftovers = [];
  // in a FULL environment every one of these is present and the list is not the question, so the
  // assertion is made only where the realm claims to be stripped
  if (G[key(['Prom', 'ise'])] === undefined) {
    for (const [ctor, methods] of [
      [key(['Arr', 'ay']), ['at', 'flat', 'includes']],
      [key(['Str', 'ing']), ['at', 'includes', 'padStart']],
    ]) for (const method of methods) if (method in G[ctor].prototype) leftovers.push(`${ ctor }.prototype.${ method }`);
  }
  assert.deepEqual(leftovers, [], 'stripped realm still stripped at the end of the run');
});
