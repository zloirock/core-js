/* eslint-disable @stylistic/no-extra-parens, no-unsafe-optional-chaining -- source seals are the boundary under test */
import { withWindowPresence } from './unbacked-window-host.cjs';
import { withRealmSlot } from './window-without-self-host.js';

QUnit.test('a sealed static claim keeps throws, keys and arguments on their source side', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const events = [];
    let held;
    function argument() {
      events.push('argument');
      return [7];
    }
    function sealed() { return (globalThis.window?.self).Array[(events.push('key'), 'from')](argument()); }
    function outsideCall() { return (globalThis.window?.self.Array.from)(argument()); }
    if (live) assert.arrayEqual(sealed(), [7]);
    else assert.throws(sealed, TypeError);
    assert.arrayEqual(events, live ? ['key', 'argument'] : []);
    events.length = 0;
    if (live) assert.arrayEqual(outsideCall(), [7]);
    else assert.throws(outsideCall, TypeError);
    assert.arrayEqual(events, ['argument'], 'a call outside the seal evaluates its argument before throwing');
    function sealedKey() { return (globalThis.window?.self).self[(events.push('key'), 'guardBoundaryAbsent')]; }
    function optionalReader() { return (globalThis.window?.self).self?.[(events.push('key'), 'guardBoundaryAbsent')]; }
    function aliasReader() {
      const alias = globalThis.window?.self;
      return (alias).self.window?.[(events.push('key'), 'guardBoundaryAbsent')];
    }
    for (const read of [sealedKey, optionalReader, aliasReader]) {
      events.length = 0;
      if (live) assert.same(read(), undefined);
      else assert.throws(read, TypeError);
      assert.arrayEqual(events, live ? ['key'] : [], 'the lower sealed read throws before its consumer');
    }
    events.length = 0;
    const value = (held = globalThis.window)?.self.Array[(events.push('key'), 'from')](argument());
    if (live) assert.arrayEqual(value, [7]);
    else assert.same(value, undefined);
    assert.same(held, globalThis.window, 'the write executes before either outcome of the guard');
    assert.arrayEqual(events, live ? ['key', 'argument'] : []);
    assert.same(globalThis.window?.self.Array.from.guardBoundaryAbsent?.value, undefined, 'a value read by the tail can still be absent');
    assert.same(delete globalThis.window?.self.Array.from.guardBoundaryAbsent, true, 'delete owns the whole open continuation');
    const box = { value: 7 };
    withRealmSlot('guardBoundaryBox', box, () => {
      assert.same(delete globalThis.window?.self.guardBoundaryBox.value, true);
      assert.same('value' in box, !live, 'the live branch deletes the source slot');
    });
    function sealedDelete() { return delete (globalThis.window?.self.Array.from).guardBoundaryAbsent; }
    if (live) assert.same(sealedDelete(), true);
    else assert.throws(sealedDelete, TypeError);
  });
});
