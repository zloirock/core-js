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

// Direct claim probes keep their read through requeue, including below another sealed claim.
QUnit.test('probe navigation: served alias reads and nested seals keep their throws', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    // The holder is observable; the constructor above it is served even when absent natively.
    withTemporaryProperty(globalThis, 'Promise', undefined, () => {
      const held = globalThis.window;
      let alias;
      try {
        alias = typeof held.Promise.resolve;
      } catch (error) {
        alias = error instanceof TypeError ? 'TypeError' : 'other';
      }
      assert.same(alias, live ? 'function' : 'TypeError', 'an inner alias read is not reclaimed');
    });
    const log = [];
    let value;
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the inner sealed read must throw
      value = (log.push('prefix'), (globalThis.window?.self).Array).of((log.push([7].at(0)), 3));
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [3] : 'TypeError', 'the inner seal owns the throwing read');
    assert.deepEqual(log, live ? ['prefix', 7] : ['prefix'], 'the prefix precedes the probe; arguments follow it');
  });
});

// Fully consumed and residual patterns keep the initializer's key in its guarded branch.
// The nested instance claim must work in the stripped realm too.
/* eslint-disable no-sequences, no-unsafe-optional-chaining, no-unreachable-loop -- discarded initializer probes */
QUnit.test('destructure probes: consumed initializer keeps live key effects', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const log = [];
    let value;
    try {
      const { of } = globalThis.window?.[log.push([7].at(0)), 'Array'];
      value = of(3);
      log.push('bound');
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [3] : 'TypeError', 'the pattern preserves its value or throw');
    assert.deepEqual(log, live ? [7, 'bound'] : [], 'the key runs once before the binding');
  });
});
QUnit.test('destructure probes: assignment and residual keep live key effects', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const log = [];
    let of, value;
    try {
      ({ of } = globalThis.window?.[log.push([8].at(0)), 'Array']);
      value = of(4);
      const { of: second, ...rest } = globalThis.window?.[log.push([9].at(0)), 'Array'];
      value = [value, second(5), typeof rest];
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [[4], [5], 'object'] : 'TypeError', 'both hosts preserve the result');
    assert.deepEqual(log, live ? [8, 9] : [], 'each host evaluates its own key once');
  });
});
QUnit.test('destructure probes: declaration siblings and loop header keep one read', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const log = [];
    let value;
    try {
      const before = (log.push('before'), 1),
            { of } = globalThis.window?.[log.push([7].at(0)), 'Array'],
            after = (log.push('after'), 2);
      for (const { from } = globalThis.window?.[log.push([8].at(0)), 'Array']; ;) {
        value = [before, of(3), after, from([4])];
        break;
      }
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [1, [3], 2, [4]] : 'TypeError', 'the original initializer position is preserved');
    assert.deepEqual(log, live ? ['before', 7, 'after', 8] : ['before'], 'siblings and the loop evaluate their effects once');
  });
});
QUnit.test('destructure probes: a bodyless assignment rejects its nullish source', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const log = [];
    let of, value;
    try {
      if (log.push('before')) ({ of } = globalThis.window?.[log.push([7].at(0)), 'Array']);
      value = of(3);
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [3] : 'TypeError', 'coercion precedes the first extracted write');
    assert.same(typeof of, live ? 'function' : 'undefined', 'a failed destructure leaves its target unwritten');
    assert.deepEqual(log, live ? ['before', 7] : ['before'], 'the guarded key keeps its original position');
  });
});
/* eslint-enable no-sequences, no-unsafe-optional-chaining, no-unreachable-loop -- discarded initializer probes */

/* eslint-disable no-unsafe-optional-chaining -- deferred receiver probes */
QUnit.test('destructure probes: deferred keys share the pristine receiver', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const log = [];
    function read({ of, from } = (log.push([7].at(0)), (globalThis.window?.self).Array)) {
      return [of(3), from([4])];
    }
    let value;
    try {
      value = [read(), read()];
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [[[3], [4]], [[3], [4]]] : 'TypeError', 'both keys are served on every activation');
    assert.deepEqual(log, live ? [7, 7] : [7], 'the live prefix runs once per attempted default');
    assert.deepEqual(read({ of: n => [n + 1], from: ns => ns[0] }), [[4], 4], 'a supplied receiver bypasses the default');
    assert.deepEqual(log, live ? [7, 7] : [7], 'a supplied receiver adds no prefix effects');
  });
});
QUnit.test('destructure probes: deferred IIFE keys and receiver children stay live', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const log = [];
    let value;
    try {
      value = (({ of, from }) => [of([3].at(0)), from([4])])(
        (log.push([8].at(0)), (globalThis.window?.self).Array),
      );
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [[3], [4]] : 'TypeError', 'both argument keys use their pure static');
    assert.deepEqual(log, [8], 'the argument prefix keeps its nested claim and runs once');
  });
});
QUnit.test('destructure probes: a cloned IIFE keeps its own temporaries on reentry', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const log = [];
    let depth = 0;
    function make() {
      const arr = [depth++];
      Object.defineProperty(arr, 'at', { get() {
        if (arr[0] === 0) read();
        return function () { return this[0]; };
      } });
      return arr;
    }
    function read({ of, from } = ((() => {
      log.push(make().at(0));
      return globalThis.window;
    })()?.self).Array) {
      return [of(3), from([4])];
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [[3], [4]] : 'TypeError', 'the nested activation completes before the outer read');
    assert.deepEqual(log, live ? [1, 0] : [1], 'reentry cannot overwrite the outer call receiver');
  });
});
/* eslint-enable no-unsafe-optional-chaining -- deferred receiver probes */

// A residual native slot keeps the memoized receiver and its live child claims.
QUnit.test('probe navigation: a partial parameter memo keeps the sealed receiver', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const log = [];
    let depth = 0;
    function make() {
      const arr = [depth++];
      Object.defineProperty(arr, 'at', { get() {
        if (arr[0] === 0) read();
        return function () { return this[0]; };
      } });
      return arr;
    }
    // eslint-disable-next-line no-unsafe-optional-chaining -- the source seal must throw when absent
    function read({ of, length } = ((() => {
      log.push(make().at(0));
      return globalThis.window;
    })()?.self).Array) {
      return [of(3), length];
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [[3], 1] : 'TypeError', 'the memo serves one slot and retains the other');
    assert.deepEqual(log, live ? [1, 0] : [1], 'a nested activation keeps its own receiver temporary');
    assert.deepEqual(read({ of: n => [n + 1], length: 4 }), [[4], 4], 'a supplied receiver bypasses the memo');
  });
});

// A stored constructor keeps the absent probe value, including inside a rebuilt argument.
QUnit.test('probe navigation: stored leaf guards retain value and argument timing', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    let held;
    let effects = 0;
    const result = [];
    result.push((held = globalThis.window?.self.Number)?.isInteger(++effects));
    assert.deepEqual(result, [live ? true : undefined], 'the call follows the stored guarded value');
    assert.same(held === undefined, !live, 'the store retains absence');
    assert.same(effects, live ? 1 : 0, 'an absent constructor skips the argument');
  });
});

// A surviving sibling forces the guarded native value to remain in the default slot.
QUnit.test('probe navigation: a partial pattern reads its guarded native value', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    let effects = 0;
    // eslint-disable-next-line no-unsafe-optional-chaining -- the pattern must throw after the short circuit
    function read({ of, length } = globalThis.window?.self.Array) { return [of(++effects), length]; }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error instanceof TypeError ? 'TypeError' : 'other';
    }
    assert.deepEqual(value, live ? [[1], 1] : 'TypeError', 'the pattern reads after the short circuit');
    assert.same(effects, live ? 1 : 0, 'the body runs only after a successful pattern read');
  });
});
