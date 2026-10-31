QUnit.test('destructuring: a fallback default reads getters after every argument', assert => {
  const log = [];
  Object.defineProperty(Array, 'missing', {
    configurable: true,
    get() { log.push('read'); return 9; },
  });
  function read(pick) {
    // eslint-disable-next-line es/no-nonstandard-array-properties, sonarjs/no-extra-arguments -- read the getter after the extra argument
    return (({ from, missing } = Array) => [from([7])[0], missing])(
      // eslint-disable-next-line no-void -- this is the undefined-shaped argument under test
      pick ? void 0 : globalThis.Array, log.push('argument'),
    );
  }
  try {
    assert.deepEqual(read(true), [7, 9]);
    assert.deepEqual(log, ['argument', 'read']);
  } finally {
    // eslint-disable-next-line es/no-nonstandard-array-properties -- restore the test-only configurable getter
    delete Array.missing;
  }
});
