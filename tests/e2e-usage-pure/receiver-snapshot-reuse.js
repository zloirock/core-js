/* global receiverCorrectionRows -- custom global slot written by the receiver tests */
import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('function coercion during method lookup retains the selected receiver', assert => {
  const previous = Object.getOwnPropertyDescriptor(Function.prototype, 'valueOf');
  try {
    // eslint-disable-next-line no-extend-native -- exercise a conversion hook installed after polyfills load
    Object.defineProperty(Function.prototype, 'valueOf', {
      configurable: true,
      value() { this(); return 1; },
    });
    for (const kind of [0, 1, 2]) {
      const held = ['held'];
      const other = ['other'];
      const events = [];
      let rows = held;
      let converted;
      function write() {
        events.push('write');
        rows = other;
      }
      Object.defineProperty(held, 'at', {
        get() {
          events.push('get');
          // eslint-disable-next-line eqeqeq -- loose equality must invoke the conversion hook
          if (kind === 0) converted = write == 1;
          else if (kind === 1) converted = write + 0;
          else converted = write < 2;
          return function (index) { return this[index]; };
        },
      });
      assert.same(rows.at(0), 'held');
      assert.same(converted, kind === 1 ? 1 : true);
      assert.same(rows, other);
      assert.arrayEqual(events, ['get', 'write']);
    }
  } finally {
    restoreProperty(Function.prototype, 'valueOf', previous);
  }
});

QUnit.test('a coercion hook can supply a different family to a function parameter', assert => {
  const previous = Object.getOwnPropertyDescriptor(Function.prototype, 'valueOf');
  let supplied;
  function read(value = 'default') { return value.at(0); }
  try {
    // eslint-disable-next-line no-extend-native -- exercise a conversion hook installed after polyfills load
    Object.defineProperty(Function.prototype, 'valueOf', {
      configurable: true,
      value() { supplied = this(['foreign']); return 1; },
    });
    assert.same(read + 0, 1);
    assert.same(supplied, 'foreign');
    assert.same(read(), 'd');
  } finally {
    restoreProperty(Function.prototype, 'valueOf', previous);
  }
});

QUnit.test('a free receiver keeps its value across a visible global key write', assert => {
  const held = ['held'];
  const other = ['other'];
  globalThis.receiverCorrectionRows = held;
  try {
    // eslint-disable-next-line no-sequences -- the key changes the binding after the receiver is selected
    assert.same(receiverCorrectionRows[globalThis.receiverCorrectionRows = other, 'at'](0), 'held');
    assert.same(globalThis.receiverCorrectionRows, other);
  } finally {
    delete globalThis.receiverCorrectionRows;
  }
});

QUnit.test('a free receiver keeps its value across a visible global getter write', assert => {
  const held = ['held'];
  const other = ['other'];
  Object.defineProperty(held, 'at', {
    get() {
      globalThis.receiverCorrectionRows = other;
      return function () { return this[0]; };
    },
  });
  globalThis.receiverCorrectionRows = held;
  try {
    assert.same(receiverCorrectionRows.at(0), 'held');
    assert.same(globalThis.receiverCorrectionRows, other);
  } finally {
    delete globalThis.receiverCorrectionRows;
  }
});

QUnit.test('private data slots retain the selected receiver across method lookup', assert => {
  const held = ['held'];
  const other = ['other'];
  const holder = [held];
  const events = [];
  Object.defineProperty(held, 'at', {
    get() {
      events.push('method');
      holder[0] = other;
      return function (index) {
        events.push(this[index]);
        return this[index];
      };
    },
  });
  assert.same(holder[0].at(0), 'held');
  assert.same(holder[0], other);
  assert.arrayEqual(events, ['method', 'held']);
  const closed = { rows: [['closed']] };
  assert.same(closed.rows[0].at(0), 'closed');
});

QUnit.test('a reentrant source store keeps each invocation receiver', assert => {
  let saved;
  let reentered = false;
  const held = ['held'];
  const other = ['other'];
  const events = [];
  Object.defineProperty(held, 'at', {
    get() {
      events.push('method');
      if (!reentered) {
        reentered = true;
        events.push(read(true));
      }
      return function (index) {
        events.push(this[index]);
        return this[index];
      };
    },
  });
  function read(nested = false) { return (saved = nested ? other : held).at(0); }
  assert.same(read(), 'held');
  assert.same(saved, other);
  assert.arrayEqual(events, ['method', 'other', 'held']);
});

QUnit.test('a captured positional sibling retains its native binding time', assert => {
  const events = [];
  const holder = {
    get at() {
      events.push('method');
      try {
        events.push(tail);
      } catch (error) {
        events.push(error.name);
      }
      return function () { return 'held'; };
    },
  };
  const [{ at: method }, tail] = [holder, 2];
  assert.same(method(), 'held');
  assert.same(tail, 2);
  // Standard block-scoping lowering represents the TDZ as an uninitialized var.
  // The getter must still run before the positional sibling is assigned.
  assert.arrayEqual(events, ['method', undefined]);
});

QUnit.test('a constructor guard selects its receiver before a getter changes the source store', assert => {
  const events = [];
  const later = { Map: 'later' };
  let realm = {
    get Map() {
      events.push('get');
      realm = later;
      return 'held';
    },
  };
  const absent = null;
  absent?.[realm = globalThis];
  const { w: { Map: selected } } = { w: realm };
  assert.same(selected, 'held');
  assert.same(realm, later);
  assert.arrayEqual(events, ['get']);
});
