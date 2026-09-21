QUnit.test('closed callers prove static sources through members and returns', assert => {
  const box = { value: Array };
  function member(held) { return held.from([1]); }
  function literal(held) { return held.from([2]); }
  function nested(held) { return held.from([3]); }
  function returned(held) { return held.from([4]); }
  function get() { return Array; }
  assert.deepEqual(member(box.value), [1]);
  assert.deepEqual(literal({ value: Array }.value), [2]);
  assert.deepEqual(nested({ box: { value: Array } }.box.value), [3]);
  assert.deepEqual(returned(get()), [4]);
});

QUnit.test('caller pattern mirrors preserve argument selection and supplied undefined', assert => {
  const events = [];
  const box = { value: Array };
  function member({ of }) { return of(1); }
  function nested({ value: { of } }, later) {
    events.push('body');
    return of(later);
  }
  function choose() {
    events.push('test');
    return true;
  }
  function fallback({ of = 7 }) { return of; }
  assert.deepEqual(member(box.value), [1]);
  assert.deepEqual(nested(choose() ? { value: Array } : { value: Array }, events.push('argument')), [2]);
  assert.deepEqual(events, ['test', 'argument', 'body']);
  assert.same(fallback({ of: undefined }), 7);
});

QUnit.test('an assigned getter invalidates the previous parameter source', assert => {
  const events = [];
  const box = { value: Array };
  Object.assign(box, { get value() {
    events.push('getter');
    return { from: () => 'custom' };
  } });
  function read(held) { return held.from([1]); }
  assert.same(read(box.value), 'custom');
  assert.deepEqual(events, ['getter']);
});

QUnit.test('custom static names remain custom beside a native caller', assert => {
  const events = [];
  function native(held) { return held.from([1]); }
  function read(held) {
    return [held.of(2), held.resolve(3), held.allSettled(4), held.groupBy(5)];
  }
  assert.deepEqual(native(Array), [1]);
  assert.deepEqual(read({
    of(value) { events.push('of'); return value; },
    resolve(value) { events.push('resolve'); return value; },
    allSettled(value) { events.push('allSettled'); return value; },
    groupBy(value) { events.push('groupBy'); return value; },
  }), [2, 3, 4, 5]);
  assert.deepEqual(events, ['of', 'resolve', 'allSettled', 'groupBy']);
});
