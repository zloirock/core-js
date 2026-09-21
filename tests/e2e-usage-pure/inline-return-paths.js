QUnit.test('inline returns: locals and nested calls keep their effects', assert => {
  const log = [];
  const value = (() => {
    const inner = [1, [2]].flat();
    log.push(inner.length);
    return globalThis;
  })()?.Array.of(5).at(0);
  assert.same(value, 5);
  assert.deepEqual(log, [2]);

  // eslint-disable-next-line unicorn/consistent-function-style -- cover an identifier-bound arrow callee
  const make = () => {
    const local = 'ab'.padStart(3, '-');
    log.push(local);
    return Array;
  };
  assert.deepEqual(make().of(7), [7]);
  assert.deepEqual(log, [2, '-ab']);
});

QUnit.test('inline returns: every branch yields the same constructor', assert => {
  for (const flag of [false, true]) {
    const log = [];
    const result = (() => {
      const local = flag;
      if (local) {
        log.push('yes');
        return Map;
      }
      log.push('no');
      return Map;
    })().groupBy([1, 2, 3], value => value % 2);
    assert.deepEqual(result.get(1), [1, 3]);
    assert.deepEqual(log, [flag ? 'yes' : 'no']);
    assert.deepEqual((() => {
      if (flag) return Array;
      // eslint-disable-next-line unicorn/no-useless-else, unicorn/no-duplicate-if-branches -- both return arms are the regression shape
      else return Array;
    })().of(4), [4]);
  }
});

QUnit.test('inline returns: local shadows and absent returns keep their values', assert => {
  const custom = { of: value => ['custom', value] };
  assert.deepEqual((() => {
    // eslint-disable-next-line sonarjs/prefer-immediate-return -- the local shadow must survive in the source
    const Array = custom;
    return Array;
  })().of(3), ['custom', 3]);
  assert.same((function Array() {
    const local = 1;
    if (local) return Array;
    return Array;
  })().of, undefined);
  let named;
  if (custom) named = function Array() {
    const local = 1;
    return local ? Array : null;
  };
  assert.same(named().of, undefined);
  for (const flag of [false, true]) {
    assert.deepEqual((() => {
      if (flag) return Array;
      return custom;
    })().of(6), flag ? [6] : ['custom', 6]);
    assert.same((() => {
      if (flag) return Array;
    })()?.of(8)?.[0], flag ? 8 : undefined);
  }
});

QUnit.test('inline returns: conditional container forwarders keep short circuits', assert => {
  for (const flag of [false, true]) {
    const log = [];
    let forward;
    if (flag) forward = () => ({ window: { Array } });
    const result = forward?.()?.window?.Array.of((log.push('arg'), 9));
    assert.deepEqual(result, flag ? [9] : undefined);
    assert.deepEqual(log, flag ? ['arg'] : []);
    const continuous = forward?.().window.Array.of((log.push('continuous'), 10));
    assert.deepEqual(continuous, flag ? [10] : undefined);
    const tail = forward?.().window.Array.of((log.push('tail'), 12)).at(0);
    assert.same(tail, flag ? 12 : undefined);
    // eslint-disable-next-line no-sequences -- the computed key observes the continuation's effect order
    const indexed = forward?.().window.Array.of((log.push('indexed'), 13))[log.push('key'), 0];
    assert.same(indexed, flag ? 13 : undefined);
    let sealed;
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed chain must throw before evaluating the argument
      sealed = (forward?.()?.window).Array.of((log.push('sealed'), 11));
    } catch (error) {
      sealed = error.name;
    }
    assert.deepEqual(sealed, flag ? [11] : 'TypeError');
    assert.deepEqual(log, flag ? ['arg', 'continuous', 'tail', 'indexed', 'key', 'sealed'] : []);
  }
});

QUnit.test('inline returns: guarded raw calls keep this and getter order', assert => {
  for (const flag of [false, true]) {
    const log = [];
    const result = (() => {
      if (flag) return Array;
      return { marker: 'custom', of(value) { return [this.marker, value]; } };
    })().of(3);
    assert.deepEqual(result, flag ? [3] : ['custom', 3]);
    let called;
    try {
      called = (() => {
        if (flag) return Array;
        return {
          get of() {
            log.push('get');
            return undefined;
          },
        };
      })().of((log.push('arg'), 4));
    } catch (error) {
      called = error.name;
    }
    assert.deepEqual(called, flag ? [4] : 'TypeError');
    assert.deepEqual(log, flag ? ['arg'] : ['get', 'arg']);
  }
});

QUnit.test('inline returns: a destructuring parameter list still proves the returned value', assert => {
  const log = [];
  function viaObject({ p }) {
    log.push(p);
    return Array;
  }
  function viaArray([q]) {
    log.push(q);
    return Object;
  }
  const { of } = viaObject({ p: 'object' });
  const { fromEntries } = viaArray.call(null, ['array']);
  assert.deepEqual(of(1, 2), [1, 2]);
  assert.deepEqual(fromEntries([['k', 1]]), { k: 1 });
  // the parameter list runs where the source ran it: a dropped read would lose these
  assert.deepEqual(log, ['object', 'array']);
});

QUnit.test('inline returns: a running parameter list keeps the read it owes', assert => {
  const log = [];
  // concise body, effect-free argument: the LIST is the only thing that runs, and what it runs is
  // observable twice over - the slot's own read, and the throw an absent source owes
  // eslint-disable-next-line no-unused-vars -- the body reading NO bound name is the claim
  const { of } = (({ p }) => Array)({
    get p() {
      log.push('getter');
      return 1;
    },
  });
  assert.deepEqual(of(1, 2), [1, 2]);
  assert.deepEqual(log, ['getter']);
  assert.throws(() => {
    // eslint-disable-next-line no-unused-vars -- same claim, over a source the slot cannot read
    const { from } = (({ q }) => Array)(undefined);
    return from;
  }, TypeError);
});

QUnit.test('unknown container selections keep named statics available', assert => {
  function box(value) { return [value]; }
  const key = [0].pop();
  const nested = { values: [Promise] };
  assert.deepEqual(box(Array)[key].from([1, 2]), [1, 2]);
  const grouped = [Object][key].groupBy([1, 2], value => value % 2);
  assert.deepEqual([grouped[0], grouped[1]], [[2], [1]]);
  assert.same(Object.getPrototypeOf(grouped), null);
  const result = nested.values[key].withResolvers();
  assert.same(typeof result.resolve, 'function');
  assert.same(typeof result.reject, 'function');
  assert.same(typeof result.promise.then, 'function');
});
