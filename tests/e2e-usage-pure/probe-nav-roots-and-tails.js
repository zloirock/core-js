import { withWindowPresence } from './unbacked-window-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

// A sequence the probe navigation is rooted in runs its prefix first and exactly once, whatever the
// guard renders into: a delete it decides, a sealed read that throws past it, a read through an
// alias holding the probe's value.
QUnit.test('probe navigation: a sequence root runs its prefix once, ahead of the test', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const held = globalThis.window;
    let effects = 0;
    withTemporaryProperty(globalThis, 'e2eSeqSlot', 1, () => {
      assert.true(delete (effects++, globalThis.window)?.self.e2eSeqSlot, 'a delete');
      assert.same(effects, 1, 'the delete runs the prefix once');
      assert.same(Object.hasOwn(globalThis, 'e2eSeqSlot'), !live, 'deletes only behind a present window');
    });
    withTemporaryProperty(globalThis, 'e2eSeqBox', { mark: 'box' }, () => {
      effects = 0;
      function sealedRead() {
        try {
          // eslint-disable-next-line no-unsafe-optional-chaining -- the throw past the seal IS the form
          return ((effects++, globalThis.window)?.self).e2eSeqBox.mark;
        } catch (error) {
          return error instanceof TypeError ? 'TypeError' : 'other';
        }
      }
      assert.same(sealedRead(), live ? 'box' : 'TypeError', 'a sealed read');
      assert.same(effects, 1, 'the sealed read runs the prefix once');
      effects = 0;
      assert.same((effects++, held)?.self.e2eSeqBox.mark, live ? 'box' : undefined, 'a read through an alias');
      assert.same(effects, 1, 'the alias read runs the prefix once');
    });
  });
});

// A kept write stores what it reads, so a realm hop it stores past another realm hop is the value
// the guard tests and the value the binding keeps - never the realm the run would fold to.
QUnit.test('probe navigation: a kept write keeps the realm hop it stores', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    let stored;
    const length = (stored = globalThis.self.window)?.window?.self.Array.from([1, 2]).length;
    assert.same(length, live ? 2 : undefined, 'the stored value decides the short-circuit');
    assert.same(stored, live ? globalThis : undefined, 'the write keeps what it read');
  });
});

// A realm-named key on the user's own object is a plain read past the guarded realm leaf, not a realm
// hop that folds onto the ponyfill.
QUnit.test('probe navigation: a realm-named key on a user object is read through', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const held = globalThis.window;
    withTemporaryProperty(globalThis, 'e2eUserHost', { window: { title: 'inner' }, title: 'outer' }, () => {
      assert.same(held?.self.e2eUserHost.window.title, live ? 'inner' : undefined, 'through an alias');
    });
  });
});
