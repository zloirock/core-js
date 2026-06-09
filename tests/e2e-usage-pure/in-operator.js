// 'key' in Constructor - static/global property checks in usage-pure mode
QUnit.test("'from' in Array -> true", assert => {
  assert.true('from' in Array);
});

QUnit.test("'resolve' in Promise -> true", assert => {
  assert.true('resolve' in Promise);
});

QUnit.test("'keys' in Object -> true", assert => {
  assert.true('keys' in Object);
});

QUnit.test("'Promise' in globalThis -> true", assert => {
  assert.true('Promise' in globalThis);
});

QUnit.test("'Map' in globalThis -> true", assert => {
  assert.true('Map' in globalThis);
});

QUnit.test('feature detection guard pattern', assert => {
  if ('from' in Array) {
    assert.deepEqual(Array.from([1, 2, 3]), [1, 2, 3]);
  } else {
    assert.true(false, 'should not reach here');
  }
});

QUnit.test("'from' in Array && 'resolve' in Promise", assert => {
  assert.true('from' in Array);
  assert.true('resolve' in Promise);
});

// the fold to `true` must still run the obj's side effect (a sequence prefix) exactly once
QUnit.test("'from' in (eff(), Array) -> SE runs once", assert => {
  const log = [];
  const r = 'from' in (log.push('e'), Array);
  assert.true(r);
  assert.deepEqual(log, ['e']);
});

// an assignment-expression obj: the fold keeps the whole assignment, so the binding still updates
QUnit.test("'groupBy' in (m = Map) -> assignment preserved", assert => {
  let m;
  // eslint-disable-next-line prefer-const -- the assignment expression is the side effect under test
  const r = 'groupBy' in (m = Map);
  assert.true(r);
  assert.same(typeof m.groupBy, 'function');
});
