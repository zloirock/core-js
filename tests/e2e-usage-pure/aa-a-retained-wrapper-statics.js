// Read before sibling imports can attach groupBy to the shared narrow Map constructor.
const effects = [];
const key = 'slot';
let observed;
let failure;
try {
  const { [(effects.push('key'), key)]: { groupBy } } = {
    get slot() { effects.push('get'); return Map; },
  };
  observed = groupBy([1, 2, 3], value => value % 2).get(1);
} catch (error) {
  failure = error;
}

QUnit.test('a retained computed slot reads its constructor static once', assert => {
  assert.same(failure, undefined);
  assert.deepEqual(observed, [1, 3]);
  assert.deepEqual(effects, ['key', 'get']);
});
