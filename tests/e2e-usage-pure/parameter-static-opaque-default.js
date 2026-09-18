QUnit.test('parameter static: known caller beside an opaque default', assert => {
  function outer(Array) {
    function read([{ of } = Array], value) { return of(value); }
    return [read([globalThis.Array], 1), read([undefined], 2)];
  }
  assert.deepEqual(outer({ of: value => ['custom', value] }), [[1], ['custom', 2]]);
});

QUnit.test('parameter static: a supplied receiver beside a different known default', assert => {
  function read([{ groupBy } = Object]) { return groupBy([1], value => value); }
  assert.deepEqual(read([Map]).get(1), [1]);
  assert.deepEqual(read([undefined])[1], [1]);
});

QUnit.test('parameter static: effectful caller beside an opaque default', assert => {
  const effects = [];
  function outer(Custom) {
    // eslint-disable-next-line default-param-last -- the later argument must run before the supplied static is extracted
    function read({ of } = Custom, later) {
      effects.push('body', later);
      return of(1);
    }
    return [read((effects.push('argument'), globalThis.Array), (effects.push('later'), 2)), read(undefined, 3)];
  }
  assert.deepEqual(outer({ of: value => ['custom', value] }), [[1], ['custom', 1]]);
  assert.deepEqual(effects, ['argument', 'later', 'body', 2, 'body', 3]);
});
