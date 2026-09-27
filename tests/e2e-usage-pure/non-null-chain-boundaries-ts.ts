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
