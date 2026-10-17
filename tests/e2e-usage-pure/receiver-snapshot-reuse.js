/* global bareKeyReceiver: writable -- the key writes this custom global slot */
/* global receiverCorrectionRows, arrayWrapperReceiver, objectPatternReceiver, optionalPatternReceiver -- custom global slots written by the receiver tests */
import { restoreProperty } from '../helpers/restore-property.cjs';

// Babel's standalone destructuring lowering advances a computed key across null rejection.
// The provider can preserve source order only while it still receives the binding pattern.
const testBeforeLowering = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

QUnit.test('array destructuring captures a free accessor receiver once', assert => {
  function assigned() {
    let method;
    // eslint-disable-next-line prefer-const, unicorn/no-useless-spread -- exercise the assignment through an inline spread
    [{ y: { at: method } }] = [...[arrayWrapperReceiver]];
    return method;
  }
  function declared() {
    // eslint-disable-next-line unicorn/no-useless-spread -- exercise the inline spread declaration route
    const [{ y: { at: method } }] = [...[arrayWrapperReceiver]];
    return method;
  }
  function withSibling() {
    let method, tail;
    // eslint-disable-next-line prefer-const, unicorn/no-useless-spread -- exercise the assignment and sibling capture
    [{ y: { at: method } }, tail] = [...[arrayWrapperReceiver], 7];
    assert.same(tail, 7);
    return method;
  }
  function nested() {
    let method;
    // eslint-disable-next-line prefer-const -- exercise the nested assignment route
    [[{ y: { at: method } }]] = [[arrayWrapperReceiver]];
    return method;
  }
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'arrayWrapperReceiver');
  const original = { y: [1, 2] };
  let reads = 0;
  try {
    // The visible accessor installation requires one GetValue for the free receiver.
    Object.defineProperty(globalThis, 'arrayWrapperReceiver', {
      configurable: true,
      get() {
        reads++;
        return reads === 1 ? original : { y: 'ab' };
      },
    });
    for (const read of [assigned, declared, withSibling, nested]) {
      reads = 0;
      const method = read();
      assert.same(method.call(original.y, -1), 2, 'the captured array supplies the method');
      assert.same(reads, 1, 'one source receiver read');
    }
  } finally {
    restoreProperty(globalThis, 'arrayWrapperReceiver', previous);
  }
});

QUnit.test('object destructuring captures a free receiver across sibling claims', assert => {
  const events = [];
  function includesMethod() { return 'held includes'; }
  function atMethod() { return 'held at'; }
  const child = {
    get at() {
      events.push('at');
      return atMethod;
    },
    get other() {
      events.push('other');
      return { q: 7 };
    },
  };
  const held = {
    get includes() {
      events.push('includes');
      return includesMethod;
    },
    get y() {
      events.push('y');
      return child;
    },
  };
  const alternate = {
    includes() { return 'other includes'; },
    y: { at() { return 'other at'; }, other: { q: 9 } },
  };
  function declared() {
    const { includes, y: { at, other: { q } } } = objectPatternReceiver;
    return [includes, at, q];
  }
  function assigned() {
    let includes, at;
    // eslint-disable-next-line prefer-const -- exercise an assignment with an earlier claim
    ({ includes, y: { at } } = objectPatternReceiver);
    return [includes, at];
  }
  function prefixed() {
    let includes, at;
    // eslint-disable-next-line prefer-const -- the prefix belongs before the one receiver read
    ({ includes, y: { at } } = (events.push('prefix'), objectPatternReceiver));
    return [includes, at];
  }
  function bodyless(test) {
    let includes, at;
    if (test) ({ includes, y: { at } } = objectPatternReceiver);
    return [includes, at];
  }
  function retained() {
    let includes, at;
    const result = { includes, y: { at } } = objectPatternReceiver;
    return [includes, at, result];
  }
  function sequenced() {
    let includes, at;
    // eslint-disable-next-line no-sequences -- the discarded assignment retains its place between the effects
    events.push('before'), { includes, y: { at } } = objectPatternReceiver, events.push('after');
    return [includes, at];
  }
  function following() {
    const { y: { at, other: { q } }, includes } = objectPatternReceiver;
    return [includes, at, q];
  }
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'objectPatternReceiver');
  let reads = 0;
  try {
    // The visible accessor installation supplies the receiver mutation proof.
    Object.defineProperty(globalThis, 'objectPatternReceiver', {
      configurable: true,
      get() {
        events.push('receiver');
        return ++reads === 1 ? held : alternate;
      },
    });
    for (const [read, expectedEvents, tail] of [
      [declared, ['receiver', 'includes', 'y', 'at', 'other'], 7],
      [assigned, ['receiver', 'includes', 'y', 'at']],
      [prefixed, ['prefix', 'receiver', 'includes', 'y', 'at']],
      [bodyless, ['receiver', 'includes', 'y', 'at']],
      [retained, ['receiver', 'includes', 'y', 'at'], held],
      [sequenced, ['before', 'receiver', 'includes', 'y', 'at', 'after']],
      [following, ['receiver', 'y', 'at', 'other', 'includes'], 7],
    ]) {
      events.length = 0;
      reads = 0;
      const result = read(true);
      assert.same(result[0], includesMethod, 'the earlier claim keeps the selected receiver');
      assert.same(result[1], atMethod, 'the nested claim keeps the selected receiver');
      assert.same(result[2], tail, 'residual bindings and assignment results keep their values');
      assert.same(reads, 1, 'one source receiver read');
      assert.arrayEqual(events, expectedEvents, 'each claim and hop stays in source order');
    }
  } finally {
    restoreProperty(globalThis, 'objectPatternReceiver', previous);
  }
});

QUnit.test('a leading claim keeps the polyfill for a sole nested instance read', assert => {
  function read() {
    const { includes, y: { at } } = objectPatternReceiver;
    return [includes.call([1, 2], 2), at.call([3, 4], -1)];
  }
  const held = [1, 2];
  Object.defineProperty(held, 'y', { value: [3, 4] });
  const alternate = { y: 'ab' };
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'objectPatternReceiver');
  let reads = 0;
  try {
    // Both claims share the receiver selected from the visible accessor.
    Object.defineProperty(globalThis, 'objectPatternReceiver', {
      configurable: true,
      get() {
        return ++reads === 1 ? held : alternate;
      },
    });
    assert.arrayEqual(read(), [true, 4], 'both extracted methods work without native methods');
    assert.same(reads, 1, 'the nested polyfill shares the first receiver');
  } finally {
    restoreProperty(globalThis, 'objectPatternReceiver', previous);
  }
});

QUnit.test('method calls retain a free receiver through their lookup', assert => {
  const events = [];
  function mark(value) { events.push(value); }
  function sequenceContinuation() { return (mark('prefix'), optionalPatternReceiver).flat?.().includes(1); }
  function bareContinuation() { return optionalPatternReceiver.flat?.().includes(1); }
  function doubleContinuation() { return (mark('prefix'), optionalPatternReceiver)?.flat?.().includes(1); }
  function memberContinuation() { return (mark('prefix'), optionalPatternReceiver)?.flat().includes(1); }
  function liftedCall() { return (mark('prefix'), optionalPatternReceiver).flat?.()[0]; }
  function bareCall() { return optionalPatternReceiver.flat?.()[0]; }
  function memberCall() { return (mark('prefix'), optionalPatternReceiver)?.flat()[0]; }
  // eslint-disable-next-line no-sequences -- the key effect follows the first receiver read
  function keyedContinuation() { return (mark('prefix'), optionalPatternReceiver)[mark('key'), 'flat']?.().includes(1); }
  function linkedContinuation() { return (mark('prefix'), optionalPatternReceiver)?.y.flat?.().includes(1); }
  function linkedCall() { return (mark('prefix'), optionalPatternReceiver)?.y.flat().includes(1); }
  function ordinary() { return optionalPatternReceiver.flat().includes(1); }
  function sequenceCall() { return (mark('prefix'), optionalPatternReceiver).flat().includes(1); }
  // eslint-disable-next-line no-sequences -- exercise the same keyed receiver in an ordinary call
  function keyedCall() { return (mark('prefix'), optionalPatternReceiver)[mark('key'), 'flat']().includes(1); }
  function boundCall() {
    const held = [1];
    return (mark('prefix'), held).flat().includes(1);
  }
  function bound() {
    const held = [1];
    return (mark('prefix'), held).flat?.().includes(1);
  }
  function completedWrite() {
    // eslint-disable-next-line no-useless-assignment -- a completed write is the lexical reuse control
    let held = [2];
    held = [1];
    return (mark('prefix'), held).flat?.().includes(1);
  }
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'optionalPatternReceiver');
  let reads = 0;
  let absent = false;
  try {
    // The visible accessor installation keeps the receiver capture necessary.
    Object.defineProperty(globalThis, 'optionalPatternReceiver', {
      configurable: true,
      get() {
        events.push('receiver');
        const value = [++reads];
        if (absent) return null;
        Object.defineProperty(value, 'y', {
          get() {
            events.push('hop');
            return value;
          },
        });
        return value;
      },
    });
    for (const [read, expected, expectedEvents, expectedReads = 1] of [
      [sequenceContinuation, true, ['prefix', 'receiver']],
      [bareContinuation, true, ['receiver']],
      [doubleContinuation, true, ['prefix', 'receiver']],
      [memberContinuation, true, ['prefix', 'receiver']],
      [liftedCall, 1, ['prefix', 'receiver']],
      [bareCall, 1, ['receiver']],
      [memberCall, 1, ['prefix', 'receiver']],
      [keyedContinuation, true, ['prefix', 'receiver', 'key']],
      [linkedContinuation, true, ['prefix', 'receiver', 'hop']],
      [linkedCall, true, ['prefix', 'receiver', 'hop']],
      [ordinary, true, ['receiver']],
      [sequenceCall, true, ['prefix', 'receiver']],
      [keyedCall, true, ['prefix', 'receiver', 'key']],
      [boundCall, true, ['prefix'], 0],
      [bound, true, ['prefix'], 0],
      [completedWrite, true, ['prefix'], 0],
    ]) {
      reads = 0;
      events.length = 0;
      assert.same(read(), expected, 'the method uses the first selected receiver');
      assert.same(reads, expectedReads, 'one GetValue for the free receiver');
      assert.arrayEqual(events, expectedEvents, 'the prefix, receiver and key keep their order');
    }
    absent = true;
    for (const read of [doubleContinuation, memberContinuation, linkedContinuation, linkedCall]) {
      reads = 0;
      events.length = 0;
      assert.same(read(), undefined, 'a nullish receiver skips the method and continuation');
      assert.same(reads, 1, 'the nullish guard retains its first receiver');
      assert.arrayEqual(events, ['prefix', 'receiver'], 'a skipped hop has no effects');
    }
  } finally {
    restoreProperty(globalThis, 'optionalPatternReceiver', previous);
  }
});

QUnit.test('a method getter keeps the selected receiver as its this-value', assert => {
  const events = [];
  function mark(value) { events.push(value); }
  function ordinary() { return (mark('prefix'), optionalPatternReceiver).flat().includes(1); }
  function optional() { return (mark('prefix'), optionalPatternReceiver).flat?.().includes(1); }
  function guarded() { return (mark('prefix'), optionalPatternReceiver)?.flat().includes(1); }
  function linked() { return (mark('prefix'), optionalPatternReceiver)?.y.flat?.().includes(1); }
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'optionalPatternReceiver');
  let reads = 0;
  try {
    // Method lookup and the visibly installed accessor's GetValue are independently observable.
    Object.defineProperty(globalThis, 'optionalPatternReceiver', {
      configurable: true,
      get() {
        events.push('receiver');
        const value = [++reads];
        Object.defineProperties(value, {
          flat: {
            get() {
              events.push('method');
              return function () {
                events.push(this === value ? 'held' : 'other');
                return [this[0]];
              };
            },
          },
          y: {
            get() {
              events.push('hop');
              return value;
            },
          },
        });
        return value;
      },
    });
    for (const [read, expectedEvents] of [
      [ordinary, ['prefix', 'receiver', 'method', 'held']],
      [optional, ['prefix', 'receiver', 'method', 'held']],
      [guarded, ['prefix', 'receiver', 'method', 'held']],
      [linked, ['prefix', 'receiver', 'hop', 'method', 'held']],
    ]) {
      reads = 0;
      events.length = 0;
      assert.same(read(), true, 'the returned method receives the selected object');
      assert.same(reads, 1, 'method lookup does not reread the free receiver');
      assert.arrayEqual(events, expectedEvents, 'method lookup precedes the call with its first this-value');
    }
    for (const optionalCall of [false, true]) {
      const held = [1];
      const other = [2];
      let rows = held;
      Object.defineProperty(held, 'flat', {
        get() {
          events.push('method');
          rows = other;
          return function () {
            events.push(this === held ? 'held' : 'other');
            return [this[0]];
          };
        },
      });
      events.length = 0;
      const result = optionalCall ? rows.flat?.().includes(1) : rows.flat().includes(1);
      assert.same(result, true, 'a method getter cannot replace the call receiver');
      assert.same(rows, other, 'the getter still writes the lexical binding');
      assert.arrayEqual(events, ['method', 'held'], 'a rebound lexical receiver keeps its first this-value');
    }
  } finally {
    restoreProperty(globalThis, 'optionalPatternReceiver', previous);
  }
});

QUnit.test('ordered nested claims reuse stable roots and retain roots a getter can replace', assert => {
  const events = [];
  const rows = [3, 4];
  let source;
  const held = {
    get row() { events.push('row'); return rows; },
    get tail() { events.push('tail'); return 7; },
  };
  const other = { row: [9], tail: 8 };
  Object.defineProperty(rows, 'at', {
    get() {
      events.push('at');
      source = other;
      return function (index) { return this[index < 0 ? this.length + index : index]; };
    },
  });
  function read() {
    let at, tail;
    // eslint-disable-next-line prefer-const -- preserve the ordered assignment and its prefix
    ({ row: { at }, tail } = (events.push('prefix'), this));
    return [at.call(rows, -1), tail];
  }
  assert.arrayEqual(read.call(held), [4, 7], 'this supplies both ordered reads');
  assert.arrayEqual(events, ['prefix', 'row', 'at', 'tail'], 'a stable root keeps every property in order');
  source = held;
  events.length = 0;
  let at, tail;
  // eslint-disable-next-line prefer-const -- the method getter rebinds the assignment source
  ({ row: { at }, tail } = source);
  assert.arrayEqual([at.call(rows, -1), tail], [4, 7], 'a captured mutable root supplies its later sibling');
  assert.same(source, other, 'the method getter still replaces the source binding');
  assert.arrayEqual(events, ['row', 'at', 'tail'], 'the later sibling reads the original root');
});

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

QUnit.test('a free receiver keeps its value across a source-visible bare key write', assert => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'bareKeyReceiver');
  const held = { at() { return 7; }, other: 'held' };
  const later = { at() { return 9; }, other: 'later' };
  const events = [];
  restoreProperty(globalThis, 'bareKeyReceiver', { configurable: true, writable: true, value: held });
  function key() {
    events.push('key');
    bareKeyReceiver = later;
  }
  try {
    const { [(key(), 'at')]: method, other } = (events.push('source'), bareKeyReceiver);
    assert.same(method(), 7);
    assert.same(other, 'held');
    assert.same(bareKeyReceiver, later);
    assert.arrayEqual(events, ['source', 'key']);
  } finally {
    restoreProperty(globalThis, 'bareKeyReceiver', previous);
  }
});

QUnit.test('a quiet sole computed-key read keeps the selected receiver without a snapshot', assert => {
  let keys = 0;
  const rows = [1, 2];
  const absent = null;
  const { [(keys++, 'at')]: literal } = [1, 2];
  const { [(keys++, 'at')]: fallback } = absent ?? [3];
  const { [(keys++, 'at')]: prototype } = Array.prototype;
  function selected(flag) {
    const { [(keys++, 'at')]: method } = flag ? rows : Array.prototype;
    return method.call([4, 5], 1);
  }
  assert.arrayEqual([literal.call([4, 5], 1), fallback.call([4, 5], 1), prototype.call([4, 5], 1)], [5, 5, 5]);
  assert.arrayEqual([selected(true), selected(false)], [5, 5]);
  assert.same(keys, 5);
});

QUnit.test('a computed key preserves source effects, selector writes and getter order', assert => {
  const events = [];
  function source() {
    events.push('source');
    return 1;
  }
  const { [(events.push('key'), 'at')]: effectful } = [source()];
  assert.same(effectful.call([7], 0), 7);
  assert.arrayEqual(events, ['source', 'key']);
  // eslint-disable-next-line no-useless-assignment -- the RHS reads flag before the computed key writes it
  let flag = true;
  const { [(flag = false, 'at')]: held } = flag ? {
    at() { return 7; },
  } : {
    at() { return 9; },
  };
  assert.same(held(), 7, 'the key cannot select another receiver');
  assert.same(flag, false, 'the selector write still runs');
  const holder = {
    get rows() {
      events.push('get');
      return [1];
    },
  };
  const { [(events.push('after get'), 'at')]: getter } = holder.rows;
  assert.same(getter.call([8], 0), 8);
  assert.arrayEqual(events, ['source', 'key', 'get', 'after get']);
});

testBeforeLowering('a claimed computed key rejects null before evaluating the key', assert => {
  let keys = 0;
  function nullable(value) {
    const { [(keys++, 'at')]: method } = value ? [1] : null;
    return method;
  }
  // Keep the caller opaque to constant selection so this remains a live Array/null instance claim.
  assert.throws(() => nullable(JSON.parse('false')), TypeError);
  assert.same(keys, 0, 'null rejection precedes the key');
});
