QUnit.test('shared selection arms retain static calls and key effects', assert => {
  for (const choice of [false, true]) {
    const log = [];
    const C0 = Array;
    const C1 = Array;
    const C2 = (log.push('first'), choice) ? C1 : C0;
    const C3 = (log.push('second'), choice) ? C2 : C1;
    const k0 = 'from';
    const k1 = 'from';
    const k2 = choice ? k1 : k0;
    const k3 = choice ? k2 : k1;
    assert.deepEqual(C3[k3]((log.push('argument'), [3])), [3]);
    assert.deepEqual(log, ['first', 'second', 'argument']);
  }
});

QUnit.test('shared key arms retain symbol and string identity', assert => {
  for (const choice of [false, true]) {
    const symbol = Symbol.iterator;
    const key = choice ? symbol : 'Symbol.iterator';
    const selected = choice ? key : key;
    const value = { [Symbol.iterator]: 3, 'Symbol.iterator': 7 };
    assert.strictEqual(value[selected], choice ? 3 : 7);
    const same = choice ? symbol : Symbol.iterator;
    assert.strictEqual([3][same]().next().value, 3);
  }
});
