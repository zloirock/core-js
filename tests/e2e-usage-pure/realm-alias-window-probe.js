import { withChangingWindow, withWindowPresence } from './unbacked-window-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('a plain read above a stored or aliased window throws before the argument', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const alias = globalThis.window;
    const key = 'Array';
    let stored = 17;
    const events = [];
    function run(read) {
      try {
        return read();
      } catch (error) {
        return error.name;
      }
    }
    assert.same(run(() => (stored = globalThis.window?.self).Array.from((events.push('stored'), [7]))[0]), live ? 7 : 'TypeError');
    assert.same(stored, live ? alias : undefined);
    // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed read must throw before the argument
    assert.same(run(() => (globalThis.window?.self)[key].of((events.push('keyed'), 9))[0]), live ? 9 : 'TypeError');
    assert.same(run(() => alias.self?.Array.of((events.push('alias'), 11))[0]), live ? 11 : 'TypeError');
    assert.same(run(() => alias?.self?.Array.of((events.push('optional'), 13))[0]), live ? 13 : undefined);
    assert.deepEqual(events, live ? ['stored', 'keyed', 'alias', 'optional'] : []);
  });
});

QUnit.test('a static iterator method is read on the constructor that called it', assert => {
  // eslint-disable-next-line unicorn/no-static-only-class -- the subclass calls the inherited method with a different receiver
  class Collection {
    static * [Symbol.iterator]() { yield this; }
    static first() { return this[Symbol.iterator]().next().value; }
  }
  class Subclass extends Collection { /* empty */ }
  assert.same(Collection.first(), Collection);
  assert.same(Subclass.first(), Subclass);
});

QUnit.test('an optional hop uses the surface saved before a later write', assert => {
  const foreign = { self: { e2eGuardRouteList: [7] } };
  withTemporaryProperty(globalThis, 'e2eGuardRouteList', [5], () => {
    let first, saved;
    assert.same((first = globalThis, saved = first, first = foreign, saved)?.self.e2eGuardRouteList.at(0), 5);
    assert.same(first, foreign);
    assert.same((first = foreign, saved = first, first = globalThis, saved)?.self.e2eGuardRouteList.at(0), 7);
    assert.same(first, globalThis);
  });
});

// a failing report cannot serialize a constructor, so reads are compared by what they hold
function held(value) {
  return value === Array ? 'Array' : typeof value;
}

QUnit.test('effectful realm keys retain the window read and its evaluation order', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const events = [];
    let first, second;
    function read() {
      // eslint-disable-next-line no-sequences -- the effect belongs to the window key
      return (first = globalThis, second = first[events.push('sequence'), 'window'].self)?.Array;
    }
    // eslint-disable-next-line no-sequences -- the key is evaluated even when the member base is nullish
    function remove() { return delete globalThis.window[events.push('delete'), 'self'].e2eAbsentRealmKey; }
    if (live) {
      assert.same(read(), Array);
      assert.same(second, globalThis);
      assert.true(remove());
    } else {
      assert.throws(read, TypeError);
      assert.same(second, undefined);
      assert.throws(remove, TypeError);
    }
    assert.deepEqual(events, ['sequence', 'delete']);
  });
});

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

QUnit.test('realm alias: a later write keeps the optional receiver and argument guard', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    withTemporaryProperty(globalThis, 'e2eLaterAliasList', ['held'], () => {
      let realm;
      // eslint-disable-next-line prefer-const -- the separate write is the tested alias shape
      realm = globalThis.window;
      let calls = 0;
      const result = realm?.window?.self.e2eLaterAliasList.at((calls++, -1));
      assert.same(result, live ? 'held' : undefined, 'reads the held receiver only when present');
      assert.same(calls, live ? 1 : 0, 'evaluates the argument only when present');
    });
  });
});

QUnit.test('a stored nullable alias keeps plain reads and optional guards distinct', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const saved = globalThis.window;
    const events = [];
    let first, second;
    const box = { set value(value) { events.push('set'); } };
    function read(callback) {
      try {
        return callback();
      } catch (error) {
        return error.name;
      }
    }
    assert.same(read(() => (first = second = saved).self?.box), live ? undefined : 'TypeError');
    // eslint-disable-next-line @stylistic/no-extra-parens -- keep the computed sequence visible
    assert.same(read(() => typeof (first = saved).self[(events.push('key'), 'Array')]), live ? 'function' : 'TypeError');
    assert.same(read(() => typeof (box.value = saved.self)), live ? 'object' : 'TypeError');
    assert.deepEqual(events, live ? ['key', 'set'] : []);
    assert.same(typeof (first = saved)?.self.Array, live ? 'function' : 'undefined');
    assert.same(first, saved);
    assert.true(delete (first = saved)?.self.Array.e2eMissingStoredAliasKey);
    assert.same(first, saved);
    assert.same(second, saved);
    const carrier = { set value(value) {
      events.push('store');
      assert.same(value, saved);
    } };
    assert.deepEqual(read(() => (carrier.value = first = saved).self.Array.of(23)), live ? [23] : 'TypeError');
    assert.deepEqual(events, live ? ['key', 'set', 'store'] : ['store']);
    assert.same(first, saved);
  });
});

QUnit.test('an IIFE static mirror retains a nullable alias read before later arguments', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const w = globalThis.window;
    const events = [];
    function read() {
      // eslint-disable-next-line sonarjs/no-extra-arguments -- the later argument checks effect ordering
      return (({ resolve: { length } }) => typeof length)(w.Promise, events.push('argument'));
    }
    if (live) assert.same(read(), 'number');
    else assert.throws(read, TypeError);
    assert.deepEqual(events, live ? ['argument'] : []);
  });
});
