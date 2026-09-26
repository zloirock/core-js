import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('destructuring: computed exclusions retain native order around nested rest bindings', assert => {
  const key = Symbol.iterator;
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  const nativeSign = Object.getOwnPropertyDescriptor(Math, 'sign');
  const events = [];
  let sign = 'old';
  let iterator;
  let rest;
  restoreProperty(globalThis, key, {
    configurable: true,
    get() {
      events.push(sign);
      return undefined;
    },
  });
  try {
    [{ [Symbol.iterator]: iterator, Math: { sign }, ...rest }] = [globalThis];
    assert.deepEqual(events, ['old']);
    assert.same(iterator, undefined);
    // A post pass can polyfill the member read exposed by lowering the native pattern.
    if (typeof E2E_POST_LOWERED === 'undefined') assert.same(sign, nativeSign && nativeSign.value);
    else assert.same(sign(-3), -1);
    assert.same(Object.hasOwn(rest, 'Math'), false);
  } finally {
    restoreProperty(globalThis, key, previous);
  }
});
