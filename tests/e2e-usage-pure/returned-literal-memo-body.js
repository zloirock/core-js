QUnit.test('returned literals: a concise sequence keeps its object after a receiver memo is declared', assert => {
  let log = [];
  // eslint-disable-next-line unicorn/consistent-function-style, no-sequences -- cover the concise arrow body becoming a memo-owning block
  const seq = () => (log.push('object'), { a: Math });
  const { a: first } = seq();
  const firstLog = log;
  log = [];
  const { a: second } = seq();
  assert.same(first.cbrt(8), 2);
  assert.same(second.cbrt(-8), -2);
  assert.same(first.trunc(8.5), 8);
  assert.same(second.trunc(-8.5), -8);
  assert.deepEqual(firstLog, ['object']);
  assert.deepEqual(log, ['object']);
});

QUnit.test('returned literals: a concise sequence keeps its array after a receiver memo is declared', assert => {
  let log = [];
  // eslint-disable-next-line unicorn/consistent-function-style, no-sequences -- cover the array twin of the concise returned container
  const seq = () => (log.push('array'), [Math]);
  const [first] = seq();
  const firstLog = log;
  log = [];
  const [second] = seq();
  assert.same(first.cbrt(8), 2);
  assert.same(second.cbrt(-8), -2);
  assert.same(first.trunc(8.5), 8);
  assert.same(second.trunc(-8.5), -8);
  assert.deepEqual(firstLog, ['array']);
  assert.deepEqual(log, ['array']);
});

QUnit.test('returned literals: receiver memos keep a parameter-filled object and nested array', assert => {
  let log = [];
  // eslint-disable-next-line unicorn/consistent-function-style, no-sequences -- cover returned slots whose constructor comes from a parameter
  const seq = value => (log.push('parameter'), { a: value, nested: [value] });
  const { a: first, nested: [nested] } = seq(Math);
  const firstLog = log;
  log = [];
  const { a: second } = seq(Math);
  assert.same(first.cbrt(8), 2);
  assert.same(nested.cbrt(27), 3);
  assert.same(second.cbrt(-8), -2);
  assert.same(first.trunc(8.5), 8);
  assert.same(nested.trunc(27.5), 27);
  assert.same(second.trunc(-8.5), -8);
  assert.deepEqual(firstLog, ['parameter']);
  assert.deepEqual(log, ['parameter']);
});

QUnit.test('returned literals: a source declaration keeps its assigned receiver and custom method', assert => {
  const log = [];
  const custom = {
    cbrt(value) {
      log.push(value);
      return this === custom ? 7 : 0;
    },
  };
  // eslint-disable-next-line unicorn/consistent-function-style -- compare a source block with the generated memo-owning block
  const seq = () => {
    // eslint-disable-next-line no-var, no-underscore-dangle -- cover a source declaration resembling an owned memo
    var _ref;
    _ref = custom;
    return { a: _ref };
  };
  const { a: viaSeq } = seq();
  assert.same(viaSeq.cbrt(8), 7);
  assert.same(viaSeq, custom);
  assert.deepEqual(log, [8]);
});
