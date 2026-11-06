import { withWindowPresence } from './unbacked-window-host.cjs';
import { withRealmSlot } from './window-without-self-host.js';

// Reading through a retained probe observes absence before the later delete key.
QUnit.test('delete: an enum hop keeps its stored probe and nested claims', assert => {
  enum Hop { SELF = 'self' }
  for (const present of [false, true]) withWindowPresence(present, live => {
    const box = { value: 7 };
    const log = [];
    let held, value;
    withRealmSlot('enumDeleteBox', box, () => {
      try {
        // @ts-expect-error the realm field is installed by the foreign host helper
        value = delete (log.push('before'), held = (log.push([7].at(0)), globalThis.window))[Hop.SELF].enumDeleteBox[log.push('key'), 'value'];
      } catch (error) {
        value = error instanceof TypeError ? 'TypeError' : 'other';
      }
    });
    assert.same(value, live ? true : 'TypeError', 'the read happens before the delete');
    assert.same(box.value, live ? undefined : 7, 'absence leaves the deleted slot untouched');
    assert.same(held, live ? globalThis : undefined, 'the source assignment keeps its value');
    assert.deepEqual(log, live ? ['before', 7, 'key'] : ['before', 7], 'each live child runs once');
  });
});
