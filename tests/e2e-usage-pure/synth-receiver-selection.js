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

QUnit.test('an observed array argument keeps its family and identity', assert => {
  const rows = [4, 15];
  const result = (function ({ at } = []) {
    // eslint-disable-next-line prefer-rest-params -- Observe the original argument, not a synthesized receiver.
    return [at.call(rows, -1), arguments[0] === rows, arguments.length];
  })(rows);
  assert.deepEqual(result, [15, true, 1]);
});

QUnit.test('arguments can change a nested receiver before its pattern runs', assert => {
  const box = { row: [4, 15] };
  // The arguments object exists during parameter evaluation, before the body scope.
  // eslint-disable-next-line default-param-last, no-undef, sonarjs/no-reference-error -- The earlier default changes the later source.
  const result = (function (first = arguments[1].row = 'ab', { row: { at } }) {
    assert.same(first, 'ab');
    return at.call(box.row, -1);
  })(undefined, box);
  assert.same(result, 'b');
});

QUnit.test('a mutable constructor argument is served outside its dead default', assert => {
  // eslint-disable-next-line no-var -- The argument proof must follow a var initializer at the call site.
  var list = Array;
  // eslint-disable-next-line es/no-nonstandard-object-properties -- This default is dead when the known argument is supplied.
  assert.deepEqual((({ of } = Object) => of(3))(list), [3]);
  let source = Object;
  assert.same(source, Object);
  source = Array;
  // eslint-disable-next-line es/no-nonstandard-object-properties -- The live argument supplies the static.
  assert.deepEqual((({ from } = Object) => from([4]))(source), [4]);
});

QUnit.test('an observed argument keeps its identity beside a dead default', assert => {
  let log = '';
  const result = (function ({ from } = (log += 'default;', Object)) {
    // eslint-disable-next-line prefer-rest-params -- The unchanged argument object is the observable.
    return [from([5])[0], arguments[0] === Array];
  })((log += 'argument;', Array));
  assert.deepEqual(result, [5, true]);
  assert.same(log, 'argument;');
});

QUnit.test('an observed selection is not replaced by a synthesized argument', assert => {
  const pick = Math.random() < 2;
  // eslint-disable-next-line es/no-nonstandard-object-properties -- The supplied selection overrides this dead default.
  const result = (function ({ from } = Object) {
    // This form retains its native read; the assertion concerns the supplied object's identity.
    // eslint-disable-next-line no-void -- Keep the destructured binding observable to the transform.
    void from;
    // eslint-disable-next-line prefer-rest-params -- The argument identity is the regression boundary.
    return arguments[0] === Array;
  })(pick ? Array : Iterator);
  assert.true(result);
});

QUnit.test('constructed and tagged receivers preserve effects and unresolved keys', assert => {
  let log = '';
  function Make() {
    log += 'make;';
    return Array;
  }
  // eslint-disable-next-line es/no-nonstandard-object-properties -- The constructor result overrides this dead default.
  const constructed = (({ from, length } = Object) => [from([6])[0], length])(new Make());
  const tagged = (({ of, length }) => [of(7)[0], length])(Make`tag`);
  assert.deepEqual(constructed, [6, 1]);
  assert.deepEqual(tagged, [7, 1]);
  assert.same(log, 'make;make;');
});
