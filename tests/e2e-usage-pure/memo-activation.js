QUnit.test('memo activation: a parameter getter reenters without replacing the outer receiver', assert => {
  let inner;
  let entered = false;
  function receiver(label, reenter) {
    return {
      label,
      get at() {
        if (reenter && !entered) {
          entered = true;
          inner = read({ list: receiver('inner') });
        }
        return function () { return this.label; };
      },
    };
  }
  function read(source, value = source.list.at(0)) { return value; }
  assert.deepEqual([read({ list: receiver('outer', true) }), inner], ['outer', 'inner']);
  assert.same(read({ list: receiver('unused', true) }, 'supplied'), 'supplied');
});

// eslint-disable-next-line es/no-proxy -- Proxy is an optional host capability, absent on IE11
if (typeof Proxy === 'function') QUnit.test('memo activation: a proxy reenters a parameter call before its receiver is consumed', assert => {
  let inner;
  let entered = false;
  function receiver(label, reenter) {
    // eslint-disable-next-line es/no-proxy -- the test is gated on host support
    return new Proxy({ label }, {
      get(target, key) {
        if (key !== 'at') return target[key];
        if (reenter && !entered) {
          entered = true;
          inner = read({ list: receiver('inner') });
        }
        return function () { return this.label; };
      },
    });
  }
  function read(source, value = source.list.at(0)) { return value; }
  assert.deepEqual([read({ list: receiver('outer', true) }), inner], ['outer', 'inner']);
});

QUnit.test('memo activation: a body call keeps its receiver during recursive getter entry', assert => {
  const events = [];
  function receiver(label, nested) {
    return {
      label,
      get at() {
        events.push(label);
        if (nested) events.push(read({ list: receiver('inner') }));
        return function () { return this.label; };
      },
    };
  }
  function read(source) { return source.list.at(0); }
  assert.same(read({ list: receiver('outer', true) }), 'outer');
  assert.deepEqual(events, ['outer', 'inner', 'inner']);
});

QUnit.test('memo activation: an instance field keeps its receiver across nested construction', assert => {
  let source;
  let inner;
  let entered = false;
  function receiver(label, reenter) {
    return {
      label,
      get at() {
        if (reenter && !entered) {
          entered = true;
          source = { list: receiver('inner') };
          inner = new Reader().value;
        }
        return function () { return this.label; };
      },
    };
  }
  class Reader {
    value = source.list.at(0);
  }
  source = { list: receiver('outer', true) };
  assert.deepEqual([new Reader().value, inner], ['outer', 'inner']);
  source = { list: receiver('next') };
  assert.same(new Reader().value, 'next');
});

QUnit.test('memo activation: a parameter mirror keeps native siblings on its own default object', assert => {
  let entered = false;
  let calls = 0;
  let inner;
  function built() {
    return {
      a: Math,
      get z() {
        if (!entered) {
          entered = true;
          inner = read();
        }
        return 'z';
      },
      w: ++calls,
    };
  }
  function read({ a: { atanh: method }, z, w } = built()) { return [typeof method, z, w, method(0)]; }
  assert.deepEqual([read(), inner, calls], [['function', 'z', 1, 0], ['function', 'z', 2, 0], 2]);
  const supplied = { a: { atanh() { return 7; } }, z: 'supplied', w: 3 };
  assert.deepEqual(read(supplied), ['function', 'supplied', 3, 7]);
  assert.same(calls, 2, 'supplied objects bypass the default factory');
});

QUnit.test('memo activation: a body caller mirror keeps native siblings during recursive entry', assert => {
  let entered = false;
  let calls = 0;
  let inner;
  function built() {
    return {
      a: Math,
      get z() {
        if (!entered) {
          entered = true;
          inner = outer();
        }
        return 'z';
      },
      w: ++calls,
    };
  }
  function read({ a: { atanh: method }, z, w }) { return [typeof method, z, w, method(0)]; }
  function outer() { return read(built()); }
  assert.deepEqual([outer(), inner, calls], [['function', 'z', 1, 0], ['function', 'z', 2, 0], 2]);
});

QUnit.test('memo activation: a nested destructured parameter default keeps its reentrant receiver', assert => {
  let source;
  let inner;
  let entered = false;
  function receiver(label, reenter) {
    return {
      label,
      get at() {
        if (reenter && !entered) {
          entered = true;
          source = { list: receiver('inner') };
          inner = read();
        }
        return function () { return this.label; };
      },
    };
  }
  function read({ nested: { value = source.list.at(0) } = {} } = {}) { return value; }
  source = { list: receiver('outer', true) };
  assert.deepEqual([read(), inner], ['outer', 'inner']);
});

QUnit.test('memo activation: a parameter capture keeps an effectful key on its own called array', assert => {
  const events = [];
  let calls = 0;
  let entered = false;
  let inner;
  function built() {
    events.push('source');
    return [++calls];
  }
  function key() {
    events.push('key');
    if (!entered) {
      entered = true;
      inner = read();
    }
    return 'at';
  }
  function read(at, flat, value = { [key()]: at, flat } = built()) {
    return [at.call(value, 0), flat.call(value)[0], value[0]];
  }
  assert.deepEqual([read(), inner, calls], [[1, 1, 1], [2, 2, 2], 2]);
  assert.deepEqual(events, ['source', 'key', 'source', 'key']);
});

QUnit.test('memo activation: parameter and field captures polyfill a proven literal array', assert => {
  const events = [];
  function read(at, flat, value = { [(events.push('parameter'), 'at')]: at, flat } = [7]) {
    return [at.call(value, 0), flat.call(value)[0]];
  }
  assert.deepEqual(read(), [7, 7]);
  let at, flat;
  class Reader {
    value = { [(events.push('field'), 'at')]: at, flat } = [8];
    result = [at.call(this.value, 0), flat.call(this.value)[0]];
  }
  assert.deepEqual(new Reader().result, [8, 8]);
  assert.deepEqual(events, ['parameter', 'field']);
});

QUnit.test('memo activation: a field capture evaluates its called array once per instance', assert => {
  const events = [];
  let calls = 0;
  let at, flat;
  function built() {
    events.push('source');
    return [++calls];
  }
  class Reader {
    value = { [(events.push('key'), 'at')]: at, flat } = built();
    result = [at.call(this.value, 0), flat.call(this.value)[0], this.value[0]];
  }
  assert.deepEqual([new Reader().result, new Reader().result, calls], [[1, 1, 1], [2, 2, 2], 2]);
  assert.deepEqual(events, ['source', 'key', 'source', 'key']);
});

QUnit.test('memo activation: a field capture keeps its called array during nested construction', assert => {
  const events = [];
  let entered = false;
  let calls = 0;
  let inner;
  let at, flat;
  function built() {
    events.push('source');
    return [++calls];
  }
  function key() {
    events.push('key');
    if (!entered) {
      entered = true;
      inner = new Reader().result;
    }
    return 'at';
  }
  class Reader {
    value = { [key()]: at, flat } = built();
    result = [at.call(this.value, 0), flat.call(this.value)[0], this.value[0]];
  }
  assert.deepEqual([new Reader().result, inner, calls], [[1, 1, 1], [2, 2, 2], 2]);
  assert.deepEqual(events, ['source', 'key', 'source', 'key']);
});

// Babel's standalone destructuring lowering evaluates these keys before rejecting null.
// Skip until Babel preserves the native order; a literal null has no instance claim.
QUnit.skip('memo activation: null parameter and field captures throw before their key effects', assert => {
  let effects = 0;
  function read(at, flat, value = { [(effects++, 'at')]: at, flat } = null) { return value; }
  let at, flat;
  class Reader {
    value = { [(effects++, 'at')]: at, flat } = null;
  }
  assert.throws(() => read(), TypeError);
  assert.throws(() => new Reader(), TypeError);
  assert.same(effects, 0);
  assert.same(at, undefined);
  assert.same(flat, undefined);
});

// Standalone post receives Babel's already lowered member reads, after the same ToObject defect.
QUnit[typeof E2E_DETECT_LOWERED === 'undefined' ? 'test' : 'skip']('memo activation: nullable array captures reject null before their key effects', assert => {
  let effects = 0;
  function built() { return JSON.parse('true') ? null : [7]; }
  function read(at, flat, value = { [(effects++, 'at')]: at, flat } = built()) { return value; }
  let at, flat;
  class Reader {
    value = { [(effects++, 'at')]: at, flat } = built();
  }
  assert.throws(() => read(), TypeError);
  assert.throws(() => new Reader(), TypeError);
  assert.same(effects, 0);
  assert.same(at, undefined);
  assert.same(flat, undefined);
});

QUnit.test('memo activation: parameter expressions preserve this, arguments and new.target', assert => {
  const source = { list: { label: 'receiver', at(value) { return [this.label, value]; } } };
  // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- parameter defaults inherit the call's arguments
  function Reader(input, value = input.list.at([this.label, arguments[0], new.target])) { this.value = value; }
  const context = { label: 'context' };
  Reader.call(context, source);
  assert.deepEqual(context.value, ['receiver', ['context', source, undefined]]);
  const instance = new Reader(source);
  assert.deepEqual(instance.value, ['receiver', [undefined, source, Reader]]);
});

QUnit.test('memo activation: method defaults and instance fields preserve super and this', assert => {
  class Base {
    get list() { return { label: 'receiver', at(value) { return [this.label, value]; } }; }
  }
  class Reader extends Base {
    label = 'instance';
    value = super.list.at(this.label);
    read(value = super.list.at(this.label)) { return value; }
  }
  const instance = new Reader();
  assert.deepEqual(instance.value, ['receiver', 'instance']);
  assert.deepEqual(instance.read(), ['receiver', 'instance']);
});

QUnit.test('memo activation: nested defaults and named class fields retain their source scope', assert => {
  const source = { list: { at(value) { return value; } } };
  function read(_ref, value = ((inner = _ref.list.at(7)) => inner)()) { return value; }
  assert.same(read(source), 7);
  const Reader = class SourceName {
    value = source.list.at(SourceName);
  };
  assert.same(new Reader().value, Reader);
});
