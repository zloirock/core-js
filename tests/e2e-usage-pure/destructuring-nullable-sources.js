import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('nullable capture: rejection precedes computed keys and leaves the target intact', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    const held = globalThis.window?.Array;
    let from = 'unchanged';
    let value;
    let failure;
    try {
      value = { [(effects.push('key'), 'from')]: from } = held;
    } catch (error) {
      failure = error;
    }
    if (present) {
      assert.same(failure, undefined);
      assert.same(value, held);
      assert.deepEqual(from([7]), [7]);
    } else {
      assert.true(failure instanceof TypeError);
      assert.same(from, 'unchanged');
      assert.same(value, undefined);
    }
    // Post-only detection receives Babel's key-before-rejection lowering.
    // The pre-lowering runtime oracle keeps the native null-before-key contract.
    assert.deepEqual(effects, present || typeof E2E_DETECT_LOWERED !== 'undefined' ? ['key'] : []);
  });
});

QUnit.test('nullable capture: a parameter rejects after all arguments, before its key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    const held = globalThis.window?.Array;
    let value;
    let failure;
    try {
      value = (({ [(effects.push('key'), 'from')]: from }, last) => [from([7]), last])(held, (effects.push('last'), 23));
    } catch (error) {
      failure = error;
    }
    if (present) {
      assert.same(failure, undefined);
      assert.deepEqual(value, [[7], 23]);
    } else assert.true(failure instanceof TypeError);
    // Babel's parameter lowering evaluates the key before rejecting undefined.
    // The exact native order is locked before lowering in nullable-capture-sources-runtime.
    assert.deepEqual(effects, ['last', 'key']);
  });
});

QUnit.test('nullable capture: a stored optional root keeps its rejection in a loop', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    let saved;
    let value;
    let failure;
    try {
      for (const { resolve } of [(saved = globalThis.window)?.Promise]) value = typeof resolve;
    } catch (error) {
      failure = error;
    }
    if (present) {
      assert.same(failure, undefined);
      assert.same(value, 'function');
    } else assert.true(failure instanceof TypeError);
    assert.same(saved, globalThis.window);
  });
});

QUnit.test('nullable capture: a plain alias read still throws before a later argument', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    const held = globalThis.window;
    let value;
    let failure;
    try {
      value = (({ resolve }, last) => [typeof resolve, last])(held.Promise, (effects.push('last'), 23));
    } catch (error) {
      failure = error;
    }
    if (present) {
      assert.same(failure, undefined);
      assert.deepEqual(value, ['function', 23]);
    } else assert.true(failure instanceof TypeError);
    assert.deepEqual(effects, present ? ['last'] : []);
  });
});

QUnit.test('nullable capture: a decided selection preserves an optional read', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const held = typeof Symbol !== 'undefined' ? globalThis.window?.Array : Set;
    const from = held?.from;
    if (present) assert.deepEqual(from([7]), [7]);
    else assert.same(from, undefined);
  });
});
