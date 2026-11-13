/* eslint-disable no-unused-vars, prefer-const, no-unsafe-optional-chaining, no-useless-assignment -- Preserve the source forms under test. */
/* eslint-disable unicorn/consistent-function-style, sonarjs/no-use-of-empty-return-value -- These calls are the subjects of the runtime checks. */
/* eslint-disable @stylistic/no-extra-parens -- Preserve the realm-probe spellings under test. */
import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('realm probe effects: read', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      return typeof (effects.push('prefix'), globalThis).window.Promise.resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('realm probe effects: declaration', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      const { resolve } = (effects.push('prefix'), globalThis).window.Promise;
      return typeof resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('realm probe effects: assignment', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      let resolve;
      ({ resolve } = (effects.push('prefix'), globalThis).window.Promise);
      return typeof resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('realm probe effects: store', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      let held;
      return typeof (held = globalThis.self).window.Promise.resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, []);
  });
});

QUnit.test('realm probe effects: store-declaration', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      let held;
      const { resolve } = (held = globalThis.self).window.Promise;
      return typeof resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, []);
  });
});

QUnit.test('realm probe effects: user-argument', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      function id(value) { return value; }
      return typeof id((effects.push('prefix'), globalThis).window.Promise.resolve);
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('realm probe effects: new-argument', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      class Box {
        constructor(value) { this.value = value; }
      } return typeof new Box((effects.push('prefix'), globalThis).window.Promise.resolve).value;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('realm probe effects: user-member', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      return typeof ((effects.push('prefix'), globalThis).window.Promise.resolve).name;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'string' : 'TypeError');
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('realm probe effects: instance-call', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      return (effects.push('prefix'), globalThis).window.Array.from([3]).at(-1);
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 3 : 'TypeError');
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('realm probe effects: nested-prefix', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      const { resolve } = (effects.push('a'), (effects.push('b'), globalThis.window))?.Promise;
      return typeof resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['a', 'b']);
  });
});

QUnit.test('realm probe effects: nested-prefix-read', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      return typeof ((effects.push('a'), (effects.push('b'), globalThis.window))?.Promise).resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['a', 'b']);
  });
});

QUnit.test('realm probe effects: nested-prefix-assignment', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      let resolve;
      ({ resolve } = (effects.push('a'), (effects.push('b'), globalThis.window))?.Promise);
      return typeof resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['a', 'b']);
  });
});

QUnit.test('realm probe effects: alias-prefix', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      const held = globalThis.window;
      return typeof ((effects.push('prefix'), held).Promise).resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('realm probe effects: quiet-call-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      function key() { return 'self'; }
      return typeof globalThis[key()].Promise.resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'function');
    assert.deepEqual(effects, []);
  });
});

QUnit.test('realm probe effects: quiet-identity-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      const key = value => value;
      return globalThis[key('self')].Array.from([3]);
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? [3] : [3]);
    assert.deepEqual(effects, []);
  });
});

QUnit.test('realm probe effects: quiet-optional-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      function key() { return 'self'; }
      return typeof globalThis[key()]?.Promise;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'function');
    assert.deepEqual(effects, []);
  });
});

QUnit.test('realm probe effects: shadow', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      const globalThis = { window: { Promise: { resolve: 31 } } };
      return globalThis.window.Promise.resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 31 : 31);
    assert.deepEqual(effects, []);
  });
});

QUnit.test('realm probe effects: effectful-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      function key() {
        effects.push('key');
        return 'self';
      } return globalThis[key()].Math.abs(-3);
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 3 : 3);
    assert.deepEqual(effects, ['key']);
  });
});

QUnit.test('realm probe effects: throwing-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      function key() {
        effects.push('key');
        throw new RangeError();
      } return globalThis[key()].Math.abs(-3);
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'RangeError' : 'RangeError');
    assert.deepEqual(effects, ['key']);
  });
});

QUnit.test('realm probe effects: changed-key', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      let key = () => 'self';
      key = () => 'Math';
      return globalThis[key()].abs(-3);
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 3 : 3);
    assert.deepEqual(effects, []);
  });
});

QUnit.test('realm probe effects: observed-store', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      let held;
      try {
        const { resolve } = (held = globalThis.self).window.Promise;
        return [typeof resolve, held === globalThis.self];
      } catch (error) { return [error.name, held === globalThis.self]; }
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? ['function', true] : ['TypeError', true]);
    assert.deepEqual(effects, []);
  });
});

QUnit.test('realm probe effects: two-prefix-levels', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function read() {
      const held = globalThis.window;
      return typeof ((effects.push('a'), (effects.push('b'), held).self).Promise).resolve;
    }
    let value;
    try {
      value = read();
    } catch (error) {
      value = error.name;
    }
    assert.deepEqual(value, present ? 'function' : 'TypeError');
    assert.deepEqual(effects, ['a', 'b']);
  });
});

QUnit.test('realm probe effects: user prototype call', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    let value;
    try {
      value = (x => globalThis)(Number.parseFloat('1.5')).window.Set.prototype.has.call(new Set([1]), 1);
    } catch (error) {
      value = error.name;
    }
    assert.strictEqual(value, present ? true : 'TypeError');
  });
});

QUnit.test('realm probe effects: inline backed member', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    let count = 0;
    let value;
    try {
      value = typeof (() => {
        count++;
        return globalThis.self;
      })().window.Map.name;
    } catch (error) {
      value = error.name;
    }
    assert.strictEqual(value, present ? 'string' : 'TypeError');
    assert.strictEqual(count, 1);
  });
});
