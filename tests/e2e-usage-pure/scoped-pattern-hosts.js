QUnit.test('a parenthesized realm selection serves both captured pattern hops', assert => {
  const G = globalThis;
  for (const flag of [true, false]) {
    let a, g;
    // eslint-disable-next-line @stylistic/no-extra-parens -- Explicit selection grouping is the source shape under test.
    const held = ({ Promise: { allSettled: a }, Map: { groupBy: g } } = (flag ? globalThis : G));
    assert.same(typeof a, 'function');
    assert.same(typeof g, 'function');
    assert.same(held, G);
  }
});

QUnit.test('a constructor pattern keeps its default and computed key in invocation order', assert => {
  const events = [];
  class Box {
    // eslint-disable-next-line es/no-nonstandard-array-properties -- The residual read is deliberate.
    constructor([{ from, [(events.push('key'), 'extra')]: extra } = Array]) {
      // eslint-disable-next-line prefer-destructuring -- Observe the method result without another assignment pattern.
      this.value = from([7])[0];
      this.extra = extra;
      events.push('body');
    }
  }
  // eslint-disable-next-line no-void -- This exact undefined argument activates the constructor's default pattern.
  assert.same(new Box([void 0]).value, 7);
  assert.same(new Box([{ from: () => [9], extra: 11 }]).extra, 11);
  assert.same(new Box([{ from: () => [9] }]).value, 9);
  assert.deepEqual(events, ['key', 'body', 'key', 'body', 'key', 'body']);
});
