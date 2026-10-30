QUnit.test('logical patch: receiver call runs once', assert => {
  let reads = 0;
  function read() {
    reads++;
    return [];
  }
  const method = read().at ||= () => 'fallback';
  assert.same(method.call([7], 0), 7);
  assert.same(reads, 1);
});

QUnit.test('logical patch: receiver getter runs once', assert => {
  let reads = 0;
  const holder = {
    get rows() {
      reads++;
      return [];
    },
  };
  const method = holder.rows.at ??= () => 'fallback';
  assert.same(method.call([7], 0), 7);
  assert.same(reads, 1);
});

QUnit.test('logical patch: key cannot replace the captured receiver', assert => {
  let rows = [];
  let keys = 0;
  const other = { at: () => 'other' };
  // eslint-disable-next-line no-sequences -- The key replaces the binding after the receiver read.
  const method = rows[keys++, rows = other, 'at'] ||= () => 'fallback';
  assert.same(method.call([7], 0), 7);
  assert.same(rows, other);
  assert.same(keys, 1);
});

QUnit.test('logical patch: receiver capture in a parameter and field', assert => {
  let reads = 0;
  function read() {
    reads++;
    return [];
  }
  function pick(method = read().at ||= () => 'fallback') { return method.call([7], 0); }
  class Box { method = read().at ??= () => 'fallback'; }
  assert.same(pick(), 7);
  assert.same(new Box().method.call([7], 0), 7);
  assert.same(reads, 2);
});

QUnit.test('logical patch: super keeps its native reference', assert => {
  let reads = 0;
  class Base {
    method;
    get at() { reads++; return undefined; }
    set at(value) { this.method = value; }
  }
  class Box extends Base {
    install() { return super.at ||= () => 'fallback'; }
  }
  const box = new Box();
  const method = box.install();
  assert.same(method(), 'fallback');
  assert.same(box.method, method);
  assert.same(reads, 1);
});

QUnit.test('logical patch: the served method does not populate the raw slot', assert => {
  const first = [];
  const second = [];
  const orMethod = first.at ||= () => 'fallback';
  const nullishMethod = second.at ??= () => 'fallback';
  assert.same(orMethod.call([7], 0), 7);
  assert.same(nullishMethod.call([7], 0), 7);
  assert.same(Object.getOwnPropertyDescriptor(first, 'at'), undefined);
  assert.same(Object.getOwnPropertyDescriptor(second, 'at'), undefined);
});

QUnit.test('logical patch: the original slot getter runs once', assert => {
  const effects = [];
  let reads = 0;
  let stored;
  const receiver = [];
  Object.defineProperty(receiver, 'at', {
    get() {
      effects.push('get');
      return reads++ ? () => 'late' : undefined;
    },
    set(value) {
      effects.push('set');
      stored = value;
    },
  });
  const method = receiver.at ||= (effects.push('rhs'), () => 'fallback');
  assert.same(method(), 'fallback');
  assert.same(stored, method);
  assert.deepEqual(effects, ['get', 'rhs', 'set']);
});
