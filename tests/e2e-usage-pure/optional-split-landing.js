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

QUnit.test('optional instance reads preserve stored realm guards', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const events = [];
    let held;
    const name = globalThis.window?.Map?.name;
    assert.same(typeof name, present ? 'string' : 'undefined');
    const last = (held = globalThis.self).window?.Array.from([1, 2]).at((events.push('index'), -1));
    assert.same(last, present ? 2 : undefined);
    assert.same(held, globalThis);
    // eslint-disable-next-line unicorn/prefer-global-this -- This source must read the bare window binding.
    const first = (held = window)?.self.Array.from([4]).at(0);
    assert.same(first, present ? 4 : undefined);
    assert.same(held, present ? globalThis : undefined);
    assert.deepEqual(events, present ? ['index'] : []);
    function missing() {
      events.push('key');
      return 'missingOptionalRealmSlot';
    }
    assert.same(globalThis[missing()]?.self.items, undefined);
    assert.same(events[events.length - 1], 'key');
  });
});

QUnit.test('logical stores keep a foreign receiver for reads, updates and delete', assert => {
  const foreign = { window: { document: 'own', count: 1 }, self: { items: [3, 4] } };
  const opts = { root: foreign };
  assert.same((opts.root ??= globalThis.self).window.document, 'own');
  (opts.root ||= globalThis.self).window.count++;
  assert.same(foreign.window.count, 2);
  assert.same(foreign.count, undefined);
  assert.same((opts.root ||= globalThis).self?.items.at(-1), 4);
  assert.same((opts.root ??= globalThis)?.self.items.at(0), 3);
  assert.true(delete (opts.root ??= globalThis.self).window.document);
  assert.false('document' in foreign.window);
  assert.same(opts.root, foreign);
  let absent = null;
  assert.throws(() => (absent &&= globalThis).self?.items.at(0), TypeError);
});

QUnit.test('a keyed optional dispatch preserves the receiver and argument order', assert => {
  const events = [];
  const box = { get rows() {
    events.push('rows');
    return [7];
  } };
  function read(receiver) {
    return receiver?.rows[(events.push('key'), 'at')]?.((events.push('arg'), -1))?.toFixed(0);
  }
  assert.same(read(null), undefined);
  assert.deepEqual(events, []);
  assert.same(read(box), '7');
  assert.deepEqual(events, ['rows', 'key', 'arg']);
  events.length = 0;
  function sealed(receiver) {
    // eslint-disable-next-line no-unsafe-optional-chaining -- The sealed call must evaluate its argument before throwing.
    return (receiver?.rows?.[(events.push('key'), 'at')])((events.push('arg'), -1));
  }
  assert.throws(() => sealed(null), TypeError);
  assert.deepEqual(events, ['arg']);
});
