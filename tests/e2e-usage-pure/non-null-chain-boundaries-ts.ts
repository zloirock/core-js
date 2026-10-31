// A postfix assertion continues its optional chain; parentheses can instead seal the
// chain before a required call. Both forms must keep receiver and computed-key effects.
QUnit.test('non-null chain: assertions preserve short-circuit boundaries', assert => {
  let effects = 0;
  const root: any = null;
  const key = () => { effects++; return 'value'; };

  assert.same(root?.fn!()[key()], undefined, 'the open chain skips the call and its tail');
  assert.same(effects, 0, 'the computed tail is skipped');
  assert.throws(() => (root?.fn)!()[key()], TypeError, 'a required call outside the chain still throws');
  assert.same(effects, 0, 'the failed call precedes the computed tail');
  assert.same((root?.fn)!?.()[key()], undefined, 'an optional call after the seal can short-circuit again');
  assert.same(effects, 0, 'the optional call skips its computed tail');
});

QUnit.test('non-null chain: calls preserve the receiver and evaluation order', assert => {
  const effects: string[] = [];
  const root = {
    get fn() {
      effects.push('get');
      return function (this: unknown) {
        effects.push(this === root ? 'this' : 'other');
        return { value: [1, [2]].flat() };
      };
    },
  };
  const key = (): 'value' => { effects.push('key'); return 'value'; };

  assert.deepEqual(root?.fn!()[key()], [1, 2]);
  assert.deepEqual(effects, ['get', 'this', 'key']);
  effects.length = 0;
  assert.deepEqual((root?.fn)!()[key()], [1, 2]);
  assert.deepEqual(effects, ['get', 'this', 'key']);
  effects.length = 0;
  assert.deepEqual((root?.fn)!?.()[key()], [1, 2]);
  assert.deepEqual(effects, ['get', 'this', 'key']);
});

// `!` ends nothing: a claim whose receiver wears it inside an open chain short-circuits with the
// whole chain, every plain link after it included, while parens and casts still seal.
QUnit.test('non-null chain: a claim behind the assertion keeps its tail in the short-circuit', assert => {
  function read(arr: number[] | null) {
    return [
      arr?.at(-1)!.toFixed(2).toString(),
      arr?.at(-1)!.toFixed(2).length,
      arr?.at(-1)!.toFixed(2)[0],
      arr?.at(-1)!!.toFixed(2).toUpperCase(),
      arr?.at(-1).toFixed(2)!.toString()!.length,
      arr?.at(-1)!.toFixed(2)?.toString(),
      arr?.at(-1)!.toFixed(2).at(0),
    ];
  }
  assert.deepEqual(read(null), [undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
  assert.deepEqual(read([2.5]), ['2.50', 4, '2', '2.50', 4, '2.50', '2']);
  assert.true(delete (null as number[] | null)?.at(-1)!.toFixed(2).k, 'a deleted tail short-circuits too');
  assert.throws(() => (((null as number[] | null)?.at(-1))!).toFixed(2), TypeError, 'a paren still seals');
  assert.throws(() => ((null as number[] | null)?.at(-1) as number).toFixed(2), TypeError, 'and so does a cast');
});

QUnit.test('non-null chain: optional calls and symbol lookups keep the assertion in the chain', assert => {
  function first(arr: any) {
    return arr?.[0].flat?.()!.length;
  }
  assert.same(first(null), undefined, 'the outer probe short-circuits the call result tail');
  assert.same(first([{}]), undefined, 'and so does the missing method');
  assert.same(first([[1, [2]]]), 2);
  function joined(lists: any) {
    return lists?.at?.(0).toReversed?.()!.length;
  }
  assert.same(joined(null), undefined, 'two joined optional dispatches keep the tail past the assertion');
  assert.same(joined([{}]), undefined, 'a missing joined method short-circuits it too');
  assert.same(joined([[1, 2]]), 2);
  function iterate(arr: string[] | null) {
    return [
      arr?.at(-1)![Symbol.iterator]().next().value,
      arr?.[0]![Symbol.iterator]?.().next().value,
      arr?.[Symbol.iterator]!().next().value,
      typeof arr?.[0]![Symbol.iterator],
    ];
  }
  assert.deepEqual(iterate(null), [undefined, undefined, undefined, 'undefined']);
  assert.deepEqual(iterate(['ab']), ['a', 'a', 'ab', 'function']);
});

QUnit.test('non-null chain: a deleted tail past the assertion keeps the short-circuit', assert => {
  // a throw is reported by name: a failing report cannot serialize the error constructor
  function outcome(run: () => unknown) {
    try {
      return run();
    } catch (error) {
      return error instanceof TypeError ? 'TypeError' : 'other';
    }
  }
  type Box = { k?: number; j?: { k?: number } };
  function remove(boxes: Box[] | null) {
    return outcome(() => delete boxes?.at(-1)!.k);
  }
  function removeNested(boxes: Box[] | null) {
    return outcome(() => delete boxes?.at(-1)!.j!.k);
  }
  const boxes: Box[] = [{ k: 1, j: { k: 2 } }];
  assert.same(remove(boxes), true, 'a deleted member past the assertion');
  assert.same(removeNested(boxes), true, 'and one more link up');
  assert.deepEqual(boxes, [{ j: {} }], 'both are deleted');
  assert.same(remove(null), true, 'a nullish root short-circuits the delete');
  assert.same(removeNested(null), true, 'with its whole tail');
  assert.same(removeNested([{}]), 'TypeError', 'an absent intermediate member is still read plainly');
  assert.same(remove([]), 'TypeError', 'so is a claim yielding undefined past the assertion');
  assert.same(removeNested([]), 'TypeError', 'with its whole tail as well');
});

// `!` ends nothing past the environment probe either: a static the claim channels rewrite - a call
// on it with a member read off the result, a member read off a missing static - short-circuits with
// the probe's `?.` where `window` is absent, while a paren still seals and the read past it throws.
QUnit.test('non-null chain: a static past the environment probe keeps the assertion in the chain', assert => {
  // a throw is reported by name: a failing report cannot serialize the error constructor
  function outcome(run: () => unknown) {
    try {
      return run();
    } catch (error) {
      return error instanceof TypeError ? 'TypeError' : 'other';
    }
  }
  const windowPresent = typeof window != 'undefined';
  const realm: any = globalThis;
  const list = [1, 2, 3];
  function parity(x: number) {
    return x % 2;
  }
  assert.same(outcome(() => realm.window?.Map!.groupBy(list, parity)!.size), windowPresent ? 2 : undefined,
    'a call on the static and a member read off its result');
  assert.same(outcome(() => globalThis.window?.Object.fromEntries([['a', 1]])!.a), windowPresent ? 1 : undefined,
    'the same off the direct root');
  assert.same(outcome(() => realm.window?.Promise.noSuchStatic!.toString()), windowPresent ? 'TypeError' : undefined,
    'a member read off a missing static');
  assert.same(outcome(() => (realm.window?.WeakMap.noSuchStatic).toString()), 'TypeError', 'a paren still seals');
});

// an assertion inside the receiver continues its chain too: the live `?.` below it is the link the
// guard tests, and the receiver past it is read plainly - a nullish there throws at the method read
QUnit.test('non-null chain: an assertion inside the receiver keeps the live link the test', assert => {
  // a throw is reported by name: a failing report cannot serialize the error constructor
  function outcome(run: () => unknown) {
    try {
      return run();
    } catch (error) {
      return error instanceof TypeError ? 'TypeError' : 'other';
    }
  }
  function afterLink(box: any) {
    return box?.list!.flatMap?.((x: number) => [x]).at(0);
  }
  assert.same(afterLink(null), undefined, 'the link short-circuits');
  assert.same(outcome(() => afterLink({})), 'TypeError', 'a nullish receiver past the assertion throws');
  assert.same(afterLink({ list: [7] }), 7);
  function betweenHops(box: any) {
    return box?.inner!.list.toSorted?.().with(0, 1);
  }
  assert.same(betweenHops(null), undefined);
  assert.same(outcome(() => betweenHops({ inner: {} })), 'TypeError', 'and so does one a hop past it');
  assert.deepEqual(betweenHops({ inner: { list: [3, 2] } }), [1, 3]);
});
