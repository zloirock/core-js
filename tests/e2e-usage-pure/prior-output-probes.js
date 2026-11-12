QUnit.test('discarded alias probes retain the source throw', assert => {
  const windowValue = Function('return this')().window;
  const absent = windowValue === null || windowValue === undefined;
  const w = globalThis.window;
  const reads = [
    () => { w.self; },
    // eslint-disable-next-line no-void -- Exercise the discarded operand rather than a value consumer.
    () => { void (0, w.self); },
  ];
  for (const read of reads) {
    if (absent) assert.throws(read, TypeError);
    else assert.same(read(), undefined);
  }
});

QUnit.test('mapped iterator binds a served method before the next read', assert => {
  const events = [];
  const row = [[], 0];
  Object.defineProperty(row, 1, { get() {
    events.push(typeof method);
    return 9;
  } });
  const { w: [{ at: method }, tail] } = { w: row };
  assert.same(method.call([3, 7], -1), 7);
  assert.same(tail, 9);
  assert.deepEqual(events, ['function']);
});
