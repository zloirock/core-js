/* eslint-disable @stylistic/no-extra-parens -- Parentheses preserve the source seal under test. */
import { withWindowPresence, withChangingWindow } from './unbacked-window-host.cjs';

QUnit.test('optional split keeps the store and computed-key order', assert => {
  const realm = globalThis;
  const log = [];
  let held;
  const value = (log.push('root'), held = realm)?.Object[(log.push('key'), 'values')]({ a: 5 }).at(0);
  assert.same(value, 5);
  assert.same(held, realm);
  assert.deepEqual(log, ['root', 'key']);
  assert.true((held = realm)?.Map?.prototype.has.call(new Map([[1, 3]]), 1));
  assert.same(held, realm);
  // eslint-disable-next-line es/no-nonstandard-map-properties -- The missing method must keep its optional call.
  assert.same((held = realm)?.Map?.optionalSplitMissing?.(log.push('arg')), undefined);
  assert.same(held, realm);
  assert.deepEqual(log, ['root', 'key']);
});

QUnit.test('optional split retains both probe outcomes and the sealed throw', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const log = [];
    const value = globalThis.window?.self?.Object[(log.push('key'), 'values')]({ a: 5 }).at(0);
    assert.same(value, present ? 5 : undefined);
    assert.same(globalThis.window?.Map?.prototype.has.call(new Map([[1, 3]]), 1), present ? true : undefined);
    assert.deepEqual(log, present ? ['key'] : []);
    let threw = false;
    let last;
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining -- The sealed source must throw when window is absent.
      last = (globalThis.window?.Array).prototype.at.call([4], 0);
    } catch (error) {
      threw = error instanceof TypeError;
    }
    assert.same(threw, !present);
    assert.same(last, present ? 4 : undefined);
  });
});

QUnit.test('optional split keeps continuation this and deletes the source slot', assert => {
  const log = [];
  const box = { value: 7, get read() {
    log.push('get');
    return function () { return [this.value]; };
  } };
  assert.same(box?.read().at(0), 7);
  assert.deepEqual(log, ['get']);
  assert.true(delete box?.value);
  assert.same(box.value, undefined);
});

QUnit.test('optional split keeps a new probe above the stored receiver', assert => {
  withChangingWindow(changing => {
    let held;
    const log = [];
    assert.same((log.push('root'), held = globalThis.window)?.window?.self.Array.from([7]).at(0), changing ? undefined : 7);
    assert.same(held, globalThis);
    assert.deepEqual(log, ['root']);
  });
  withChangingWindow(changing => {
    let held;
    assert.same((held = globalThis.window)?.window?.self.Map.prototype.has.call(new Map(), 1), changing ? undefined : false);
    assert.same(held, globalThis);
  });
});
