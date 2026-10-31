// The exported factory exposes its subclass and the statics of either possible base.
export function makeSubclass(flag) {
  return class extends (() => {
    if (flag) return Map;
    // eslint-disable-next-line unicorn/no-static-only-class -- the other return must also be a valid superclass
    return class {
      static groupBy() {
        return { get: () => ['custom'] };
      }
    };
  })() {};
}

QUnit.test('inline returns: an escaping subclass carries inherited statics', assert => {
  for (const flag of [false, true]) {
    const Derived = makeSubclass(flag);
    assert.deepEqual(Derived.groupBy([1, 2, 3], value => value % 2).get(1), flag ? [1, 3] : ['custom']);
  }
});
