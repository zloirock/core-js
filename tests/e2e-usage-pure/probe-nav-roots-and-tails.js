import { withWindowPresence } from './unbacked-window-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

// Effectful realm keys stay in the source access. Their nested instance claims remain live,
// including before an optional test and inside a branch that may never run.
/* eslint-disable no-sequences -- computed-key effects are the fallback boundary under test */
QUnit.test('probe navigation: effectful realm keys preserve the native fallback', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    withTemporaryProperty(globalThis, 'e2eFallbackValue', 17, () => {
      const log = [];
      let held;
      const rootKey = globalThis[log.push('root'), 'window']?.self.e2eFallbackValue;
      assert.same(rootKey, live ? 17 : undefined, 'an effect before the probe always runs');
      const branchKey = (held = globalThis.window)?.[log.push('branch'), 'self'].e2eFallbackValue;
      assert.same(branchKey, live ? 17 : undefined, 'a guarded key runs only on the live branch');
      assert.same(held, live ? globalThis : undefined, 'the store keeps its source value');
      let sealed;
      try {
        // eslint-disable-next-line no-unsafe-optional-chaining -- the read past the seal must throw
        sealed = (globalThis[log.push('sealed'), 'window']?.self).e2eFallbackValue;
      } catch (error) {
        sealed = error instanceof TypeError ? 'TypeError' : 'other';
      }
      assert.same(sealed, live ? 17 : 'TypeError', 'the sealed read retains its exception');
      assert.deepEqual(log, live ? ['root', 'branch', 'sealed'] : ['root', 'sealed'], 'key claims execute once in order');
    });
  });
});

// Declining the outer navigation must leave every independent key visitor live.
QUnit.test('probe navigation: fallback keys retain static and destructured instance claims', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    withTemporaryProperty(globalThis, 'e2eFallbackValue', 17, () => {
      const log = [];
      const value = globalThis.window?.[
        log.push(Array.from([1])[0]),
        (() => { const { of } = Array; log.push(of(2)[0]); })(),
        (() => { for (const { at } of [[3]]) log.push(at.call([3], 0)); })(),
        'self'
      ].e2eFallbackValue;
      assert.same(value, live ? 17 : undefined, 'the source branch determines the value');
      assert.deepEqual(log, live ? [1, 2, 3] : [], 'all nested claims run once, or all skip');
    });
  });
});

// Alias classification must not re-admit a realm key through the container walk.
QUnit.test('probe navigation: alias fallback keeps a throwing realm read', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    withTemporaryProperty(globalThis, 'e2eFallbackValue', 17, () => {
      const log = [];
      let realm, held, value;
      try {
        value = (realm = globalThis, held = realm[log.push('alias'), 'window'].self)?.e2eFallbackValue;
      } catch (error) {
        value = error instanceof TypeError ? 'TypeError' : 'other';
      }
      assert.same(value, live ? 17 : 'TypeError', 'the alias read keeps its exception');
      assert.same(held, live ? globalThis : undefined, 'a failed read does not complete the store');
      assert.deepEqual(log, ['alias'], 'the independent key claim runs once');
      assert.same({ window: Array }[log.push('container'), 'window'].from([9])[0], 9, 'a user container keeps static claims');
    });
  });
});

/* eslint-enable no-sequences -- the computed-key cases end here */

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
