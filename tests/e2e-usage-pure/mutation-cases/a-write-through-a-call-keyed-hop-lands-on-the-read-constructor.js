// a WRITE through a realm hop keyed by a call (`globalThis[key('WeakMap')].slot = ...`) runs the key
// once and lands on the constructor a read through the same hop sees - plain, logical, update, delete
/* eslint-disable es/no-nonstandard-weakmap-properties -- the slot the hop writes IS the case under test */
QUnit.test('call-keyed hop: a write lands on the constructor the read sees', assert => {
  let calls = 0;
  function key(name) {
    calls++;
    return name;
  }
  globalThis[key('WeakMap')].slotForTheHopTest = 1;
  assert.same(WeakMap.slotForTheHopTest, 1);
  globalThis[key('WeakMap')].slotForTheHopTest ??= 2;
  globalThis[key('WeakMap')].slotForTheHopTest++;
  assert.same(WeakMap.slotForTheHopTest, 2);
  delete globalThis[key('WeakMap')].slotForTheHopTest;
  assert.same(WeakMap.slotForTheHopTest, undefined);
  assert.same(calls, 4);
});
/* eslint-enable es/no-nonstandard-weakmap-properties -- end of the case */
