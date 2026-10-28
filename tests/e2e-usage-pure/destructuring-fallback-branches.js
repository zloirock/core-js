QUnit.test('destructuring: fallback synth preserves branch and receiver effects', assert => {
  function read(pick, nested) {
    const log = [];
    const { from, of, missing = (log.push('default'), 9) } = (log.push('before'), pick
      // The selected constructor keeps the right arm dead.
      ? nested ? (log.push('array'), Array) || (log.push('dead'), Object)
        : (() => { log.push('call'); return globalThis.Array; })()
      : { from: value => value, of: value => [value] });
    return [from([7])[0], of(8)[0], missing, log];
  }
  assert.deepEqual(read(true, true), [7, 8, 9, ['before', 'array', 'default']]);
  assert.deepEqual(read(true, false), [7, 8, 9, ['before', 'call', 'default']]);
  assert.deepEqual(read(false, true), [7, 8, 9, ['before', 'default']]);
});

QUnit.test('destructuring: fallback synth distinguishes undefined from null', assert => {
  function read(pick) {
    // eslint-disable-next-line es/no-nonstandard-array-properties, no-void -- an absent key and a void-shaped argument exercise default selection
    return (({ from, missing = 9 } = Array) => [from([7])[0], missing])(pick ? void 0 : globalThis.Array);
  }
  function nullable(pick) {
    return (({ from } = Array) => from([8]))(pick ? null : globalThis.Array);
  }
  assert.deepEqual(read(true), [7, 9]);
  assert.deepEqual(read(false), [7, 9]);
  assert.throws(() => nullable(true), TypeError);
  assert.deepEqual(nullable(false), [8]);
});

QUnit.test('destructuring: an undefined logical left cannot activate the parameter default', assert => {
  // eslint-disable-next-line no-constant-binary-expression -- both selectors must choose the right arm
  const or = (({ from } = Iterator) => typeof from([7]).next)(undefined || Array);
  // eslint-disable-next-line no-constant-binary-expression -- the nullish selector has the same boundary
  const nullish = (({ from } = Iterator) => typeof from([7]).next)(undefined ?? Array);
  assert.same(or, 'undefined');
  assert.same(nullish, 'undefined');
  // eslint-disable-next-line no-constant-binary-expression -- AND delivers its undefined left to the default
  const and = (({ from } = Iterator) => typeof from([7]).next)(undefined && Array);
  assert.same(and, 'function');
});
