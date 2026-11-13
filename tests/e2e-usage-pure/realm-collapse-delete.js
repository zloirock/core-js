/* eslint-disable no-unused-vars, prefer-const, no-unsafe-optional-chaining -- Preserve the mutation and guard source forms. */
/* eslint-disable @stylistic/no-extra-parens, unicorn/consistent-function-style, sonarjs/no-use-of-empty-return-value -- Parentheses and calls are test subjects. */
/* eslint-disable no-eq-null, es/no-nonstandard-boolean-prototype-properties, unicorn/no-unreadable-array-destructuring -- Negative mutation and null-test controls. */
/* eslint-disable sonarjs/no-redundant-parentheses, no-sequences -- Explicit seal and key-effect forms. */
import { withWindowPresence } from './unbacked-window-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('realm collapse: sequence-delete', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (effects.push('prefix'), globalThis.window)?.window.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, ['prefix']);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: declined-sequence', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (effects.push('prefix'), globalThis?.window)?.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, ['prefix']);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: quiet-sequence', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (0, globalThis.window)?.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: nested-sequence', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (effects.push('a'), (effects.push('b'), globalThis.window))?.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, ['a', 'b']);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: outer-guard', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete globalThis.self.window?.window.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: outer-guard-sequence', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (effects.push('prefix'), globalThis.self.window)?.window.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, ['prefix']);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: outer-guard-update', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return (globalThis.self.window?.window).slotD++;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 17 : 'TypeError');
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 18 : 17);
    }));
  });
});

QUnit.test('realm collapse: outer-guard-write', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return (globalThis.self.window?.window).slotD = (effects.push('rhs'), 31);
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 31 : 'TypeError');
      assert.deepEqual(effects, ['rhs']);
      assert.strictEqual(root.slotD, present ? 31 : 17);
    }));
  });
});

QUnit.test('realm collapse: outer-guard-pattern', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        let source = [31];
        [(globalThis.self.window?.window).slotD] = source;
        return true;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? true : 'TypeError');
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 31 : 17);
    }));
  });
});

QUnit.test('realm collapse: outer-guard-loop', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        for ((globalThis.self.window?.window).slotD of [31]) effects.push('body');
        return true;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? true : 'TypeError');
      assert.deepEqual(effects, present ? ['body'] : []);
      assert.strictEqual(root.slotD, present ? 31 : 17);
    }));
  });
});

QUnit.test('realm collapse: branch-consequent', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        const x = { window: { slotD: 23 } };
        const d = delete (choice ? globalThis : x).window.slotD;
        return [d, x.window.slotD];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? [true, undefined] : [true, undefined]);
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: branch-alternate', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        const x = { window: { slotD: 23 } };
        const d = delete (choice ? x : globalThis).window.slotD;
        return [d, x.window.slotD];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? [true, 23] : 'TypeError');
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: null-test', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (globalThis == null).window.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'TypeError' : 'TypeError');
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: nonnull-test', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (globalThis != null).window.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'TypeError' : 'TypeError');
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: logical-control', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (choice && globalThis).window.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'TypeError' : 'TypeError');
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: stored-guard', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        let held;
        const d = delete (held = globalThis.window)?.slotD;
        return [d, typeof held];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? [true, 'object'] : [true, 'undefined']);
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: sealed-read', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return typeof (globalThis.window?.Promise)[(effects.push('key'), 'noSuchStatic')];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'undefined' : 'TypeError');
      assert.deepEqual(effects, ['key']);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: sealed-delete', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete (globalThis.window?.Promise)[(effects.push('key'), 'noSuchStatic')];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? true : 'TypeError');
      assert.deepEqual(effects, ['key']);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: double-sealed', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return typeof ((globalThis.window?.Promise))[(effects.push('key'), 'noSuchStatic')];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'undefined' : 'TypeError');
      assert.deepEqual(effects, ['key']);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: dynamic-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        const key = () => 'resolve';
        return typeof (globalThis.window?.Promise)[key()];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'function' : 'TypeError');
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: effectful-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        const key = () => (effects.push('key'), 'resolve');
        return typeof (globalThis.window?.Promise)[key()];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'function' : 'TypeError');
      assert.deepEqual(effects, ['key']);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: throwing-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        const key = () => {
          effects.push('key');
          throw new RangeError();
        };
        return typeof (globalThis.window?.Promise)[key()];
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'RangeError' : 'RangeError');
      assert.deepEqual(effects, ['key']);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: instance', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return (effects.push('prefix'), globalThis).window?.globalThis.items?.at(-1);
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 3 : undefined);
      assert.deepEqual(effects, ['prefix']);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: optional-instance-call', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return (effects.push('prefix'), globalThis).window?.globalThis.items?.at?.(-1);
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 3 : undefined);
      assert.deepEqual(effects, ['prefix']);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: terminal', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return typeof (effects.push('prefix'), globalThis.window)?.self;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? 'object' : 'undefined');
      assert.deepEqual(effects, ['prefix']);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: claimed-delete', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete globalThis.self?.window?.window?.Reflect.slot;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: claimless-delete', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        return delete globalThis.self?.window?.window?.self.slotD;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? undefined : 17);
    }));
  });
});

QUnit.test('realm collapse: vestigial-delete', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        const g = globalThis;
        return delete g.window?.Reflect?.slot;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.true(value);
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

QUnit.test('realm collapse: vestigial-read', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const root = globalThis;
    return withTemporaryProperty(root, 'slotD', 17, () => withTemporaryProperty(root, 'items', [1, 3], () => {
      const effects = [];
      function read(choice) {
        const g = globalThis;
        return g.window?.Reflect?.slot;
      }
      let value;
      try {
        value = read(false);
      } catch (error) {
        value = error.name;
      }
      assert.deepEqual(value, present ? undefined : undefined);
      assert.deepEqual(effects, []);
      assert.strictEqual(root.slotD, present ? 17 : 17);
    }));
  });
});

// Ordinary unbacked navigation keeps the established pure collapse onto self.
// Standalone post sees the lowered null test and keeps the native absent-window value.
// Mutating consumers above use the stricter source guard checked separately.
QUnit.test('realm collapse: ordinary unbacked read', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    withTemporaryProperty(globalThis, 'slotD', 17, () => {
      const value = (effects.push('prefix'), globalThis.self.window)?.window.slotD;
      assert.strictEqual(value, typeof E2E_DETECT_LOWERED !== 'undefined' && !present ? undefined : 17);
      assert.deepEqual(effects, ['prefix']);
    });
  });
});
