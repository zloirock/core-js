QUnit.test('destructuring: captured selections keep their receiver and static', assert => {
  function declared(shim) {
    let from;
    const host = { from } = shim || Array;
    return [host, from];
  }
  function assigned(shim) {
    let from, host;
    // eslint-disable-next-line prefer-const -- exercising an assignment capture
    host = { from } = shim ?? Array;
    return [host, from];
  }
  function argument(shim) {
    let from;
    return (host => [host, from])({ from } = shim || Array);
  }
  function returned(shim) {
    let from;
    function capture() {
      return { from } = shim || Array;
    }
    const host = capture();
    return [host, from];
  }
  for (const run of [declared, assigned, argument, returned]) {
    const builtin = run(null);
    assert.same(builtin[0], Array);
    assert.same(builtin[1], Array.from);
    const user = { from: 42 };
    assert.deepEqual(run(user), [user, 42]);
  }
});

QUnit.test('destructuring: a captured selection preserves defaults and property order', assert => {
  function read(shim) {
    const log = [];
    let from, other;
    const host = { from = (log.push('default'), 9), other } = (log.push('init'), shim || Array);
    return [host, from, other, log];
  }
  const user = { from: undefined, other: 7 };
  assert.deepEqual(read(user), [user, 9, 7, ['init', 'default']]);
  const builtin = read(null);
  assert.same(builtin[0], Array);
  assert.same(builtin[1], Array.from);
  assert.deepEqual(builtin[3], ['init']);
});

QUnit.test('destructuring: every static in a captured selection is dispatched', assert => {
  function read(shim) {
    let from, of;
    const host = { from, of = 9 } = shim || Array;
    return [host, from, of];
  }
  assert.deepEqual(read(null), [Array, Array.from, Array.of]);
  const user = { from: 7 };
  assert.deepEqual(read(user), [user, 7, 9]);
});

QUnit.test('destructuring: selecting declarations retain unknown keys between static reads', assert => {
  function read(source, key) {
    const { from, [key]: other, of = 17 } = source || Array;
    return [from, other, of];
  }
  let coercions = 0;
  const key = {
    toString() {
      coercions++;
      return 'length';
    },
  };
  assert.deepEqual(read(null, key), [Array.from, 1, Array.of]);
  assert.same(coercions, 1);
  let reads = 0;
  const source = { get from() { return ++reads; } };
  assert.deepEqual(read(source, 'from'), [1, 2, 17]);
  assert.same(reads, 2);
});

// a nested pattern moved onto a keyed capture reads what the capture holds: a selection's falsy left
// or a slot present beside an inner default is not the constructor the claim names
QUnit.test('destructuring: a keyed capture keeps the value its selection or slot yielded', assert => {
  function selected(cnd) {
    const log = [];
    const { Array: { [(log.push('k'), 'of')]: a, from: b } } = cnd && { Array };
    return [typeof a, typeof b, log];
  }
  function wrapped(cnd) {
    const log = [];
    const [{ Array: { [(log.push('k'), 'of')]: a, from: b } }] = [cnd && { Array }];
    return [typeof a, typeof b, log];
  }
  function slot() {
    const log = [];
    const holder = { y: { of: 1, from: 2 } };
    const { y: { [(log.push('k'), 'of')]: a, from: b } = Array } = holder;
    return [a, b, log];
  }
  for (const read of [selected, wrapped]) {
    assert.throws(() => read(false), TypeError);
    assert.throws(() => read(0), TypeError);
    assert.throws(() => read(null), TypeError);
    assert.deepEqual(read(true)[2], ['k']);
  }
  assert.deepEqual(slot(), [1, 2, ['k']]);
});
