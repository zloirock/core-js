import { withChangingWindow, withWindowPresence } from './unbacked-window-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

// a failing report cannot serialize a constructor, so reads are compared by what they hold
function held(value) {
  return value === Array ? 'Array' : typeof value;
}

// A local alias of the realm reads `window` exactly as the realm name it holds: an optional link
// over that read is the environment probe the source observes, so it short-circuits off-window,
// keeps the delete it decides from happening, and reads the live slot every time.
QUnit.test('realm alias: an optional window probe keeps its short-circuit', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const viaGlobal = globalThis;
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- a `self` alias is the test subject
    const viaSelf = self;
    const expected = live ? 'Array' : 'undefined';
    assert.same(held(viaGlobal.window?.Array), expected, 'a read through a globalThis alias');
    assert.same(held(viaSelf.window?.Array), expected, 'a read through a self alias');
    assert.same(typeof viaGlobal.window?.Array, live ? 'function' : 'undefined', 'a typeof');
    function construct() {
      try {
        // eslint-disable-next-line no-unsafe-optional-chaining -- constructing the short-circuit IS the form
        return new (viaGlobal.window?.Array)(2).length;
      } catch (error) {
        return error instanceof TypeError ? 'TypeError' : 'other';
      }
    }
    assert.same(construct(), live ? 2 : 'TypeError', 'a construct');
    withTemporaryProperty(Array, 'e2eAliasProbe', 1, () => {
      assert.true(delete viaGlobal.window?.Array.e2eAliasProbe, 'a delete');
      assert.same(Object.hasOwn(Array, 'e2eAliasProbe'), !live, 'deletes only behind a present window');
    });
    assert.same(held(globalThis.window?.Array), expected, 'the direct spelling agrees');
    assert.same(held(viaGlobal.self?.Array), 'Array', 'a backed hop still folds');
    assert.same((alias => alias.window?.Array)({ window: { Array: 5 } }), 5, 'a shadowing parameter is no alias');
  });
});

QUnit.test('realm alias: the window probe reads the live slot', assert => {
  withChangingWindow(changing => {
    const viaGlobal = globalThis;
    const first = viaGlobal.window?.Array;
    const second = viaGlobal.window?.Array;
    assert.same(held(first), 'Array', 'the first read sees a window');
    assert.same(held(second), changing ? 'undefined' : 'Array', 'a second read sees the slot change');
  });
});

// An alias holding the environment probe's VALUE is absent wherever that probe is: the optional link
// over it decides whether a delete acts at all, through the realm hops above it as well.
QUnit.test('realm alias: a window-valued alias keeps its probe under a delete', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const win = globalThis.window;
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- a `self` hop is the test subject
    const late = self.window;
    withTemporaryProperty(globalThis, 'e2eHeldProbe', 1, () => {
      assert.true(delete win?.self.e2eHeldProbe, 'a delete through a realm hop');
      assert.same(Object.hasOwn(globalThis, 'e2eHeldProbe'), !live, 'deletes only behind a present window');
    });
    withTemporaryProperty(globalThis, 'e2eHeldBox', { slot: 1 }, () => {
      assert.true(delete late?.globalThis.e2eHeldBox.slot, 'and one more member up');
      assert.same(Object.hasOwn(globalThis.e2eHeldBox, 'slot'), !live, 'deletes it only behind a present window');
    });
  });
});
