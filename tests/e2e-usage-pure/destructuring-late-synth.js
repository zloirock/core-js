/* eslint-disable no-sequences, unicorn/no-unreadable-iife -- effectful inline receivers exercise late synthesis */
QUnit.test('a late default keeps nested claims and evaluates its receiver once per call', assert => {
  const log = [];
  function read({ of, length } = (() => (log.push([7].at(0)), globalThis))().Array) {
    return [of(3), length];
  }
  assert.deepEqual(read(), [[3], 1]);
  assert.deepEqual(read(), [[3], 1]);
  assert.deepEqual(log, [7, 7]);
  assert.deepEqual(read({ of: n => [n + 1], length: 9 }), [[4], 9]);
  assert.deepEqual(log, [7, 7], 'a supplied value does not evaluate the default');
});

QUnit.test('a late argument memo preserves nested claims and a decided fallback', assert => {
  const log = [];
  const result = (({ of, length }) => [of(3), length])(
    (() => (log.push([7].at(0)), Array))() || Set,
  );
  assert.deepEqual(result, [[3], 1]);
  assert.deepEqual(log, [7]);
});
