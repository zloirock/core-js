QUnit.test('inline returns: an unresolved local static keeps its namespace', assert => {
  for (const flag of [false, true]) {
    const custom = { groupBy: () => ({ get: () => ['custom'] }) };
    const grouped = (() => {
      // eslint-disable-next-line no-unreachable-loop, no-unmodified-loop-condition -- preserve a loop-return body for the receiver proof
      while (flag) return Map;
      return custom;
    })().groupBy([1, 2, 3], value => value % 2);
    assert.deepEqual(grouped.get(1), flag ? [1, 3] : ['custom']);
  }
});
