/* eslint-disable dot-notation, no-lone-blocks, no-shadow -- regression inputs require literal keys and lexical shadows */
/* eslint-disable unicorn/no-unreadable-array-destructuring, unicorn/no-unused-properties -- regression inputs require member targets */
/* eslint-disable unicorn/no-unsafe-property-key -- the regression must exercise implicit key coercion */

QUnit.test('inherited toString calls retain their string result and own overrides', assert => {
  const box = {
    run() {
      this.toString.at;
      return this.toString().at(-1);
    },
  };
  assert.same(box.run(), ']');
  const own = { toString() { return [8, 9]; } };
  assert.same(own.toString().at(-1), 9);
  // eslint-disable-next-line sonarjs/prefer-object-literal -- the test requires a later slot write
  const written = {};
  written.toString = () => [3, 4];
  assert.same(written.toString().at(-1), 4);
});

QUnit.test('for-member write: iterable, head reads and shadowed receivers', assert => {
  const values = [[1, 2]];
  const seen = [];
  for (values.at of values.at(0)) seen.push(values.at);
  assert.deepEqual(seen, [1, 2]);

  const key = [1, 2];
  for ({ [key.at(0)]: key.at } of [{ 1: 7 }]) assert.same(key.at, 7);

  const fallback = [3, 4];
  for ([fallback.at = fallback.at(-1)] of [[]]) assert.same(fallback.at, 4);

  const outer = [];
  for (outer.at of [function () { return 'written'; }]) {
    {
      const outer = 'abc';
      assert.same(outer.at(-1), 'c');
    }
  }
});

// Babel's for-of/block-scoping lowering writes to the body's shadow before initialization.
QUnit.skip('for-member write: direct body shadow survives downstream Babel lowering', assert => {
  const outer = [];
  for (outer.at of [function () { return 'written'; }]) {
    const outer = 'abc';
    assert.same(outer.at(-1), 'c');
  }
});

QUnit.test('for-member write: literal receiver keys retain the assigned method', assert => {
  const o = { true: [], null: [] };
  for (o[true].at of [function () { return 'boolean'; }]) assert.same(o[true].at(0), 'boolean');
  for (o[null].at of [function () { return 'null'; }]) assert.same(o[null].at(0), 'null');
});

QUnit.test('for-member write: a changed computed key reads a different receiver', assert => {
  const o = [[], [3, 4]];
  let key = 0;
  for (o[key].at of [function () { return 'written'; }]) {
    key = 1;
    assert.same(o[key].at(-1), 4);
  }
  const values = [7, 8];
  const seen = [];
  for (values.at in { [values.at(0)]: true }) seen.push(values.at);
  assert.deepEqual(seen, ['7']);
});

QUnit.test('disable-next-line: trailing block comment leaves the next statement enabled', assert => {
  assert.true(
    // core-js-disable-next-line
    true); /* continued
    comment */ assert.same([1, 2].at(-1), 2);
});

QUnit.test('for-member write: replacement receivers retain their polyfills', assert => {
  let values = [];
  for (values.at of [0]) {
    values = 'abc';
    assert.same(values.at(-1), 'c');
  }
  const box = { values: [] };
  for (box.values.at of [0]) {
    box.values = 'abc';
    assert.same(box.values.at(-1), 'c');
  }
  const containers = [[], [3, 4]];
  let index = 0;
  const key = { toString() { return String(index); } };
  for (containers[key].at of [0]) {
    index = 1;
    assert.same(containers[key].at(-1), 4);
  }
});

QUnit.test('for-member write: repeated getter reads preserve values and effects', assert => {
  let calls = 0;
  const changing = { get values() { return calls++ ? 'abc' : []; } };
  for (changing.values.at of [0]) assert.same(changing.values.at(-1), 'c');
  assert.same(calls, 2);

  const fresh = { get values() { return [3, 4]; } };
  for (fresh.values.at of [0]) assert.same(fresh.values.at(-1), 4);
});

QUnit.test('for-member write: captured container aliases retain their owners', assert => {
  const inner = { value: [] };
  const box = { inner };
  for (box.inner.value.at of [0]) {
    inner.value = 'abc';
    assert.same(box.inner.value.at(-1), 'c');
  }

  function read() {
    const getterInner = { value: [] };
    // eslint-disable-next-line no-unreachable-loop -- the source regression reads immediately after the head write
    for (getterBox.inner.value.at of [0]) return [getterBox.inner.value.at(-1), getterInner.value.length];
  }
  const getterInner = { get value() { return [3, 4]; } };
  const getterBox = { inner: getterInner };
  assert.deepEqual(read(), [4, 0]);
});

QUnit.test('for-member write: nested getter calls keep their order and returned arrays', assert => {
  let reads = 0;
  const inner = {
    get value() {
      reads++;
      return [3, 4];
    },
  };
  const box = { wrap: { inner } };
  for (box.wrap.inner.value.at of [0]) assert.same(box.wrap.inner.value.at(-1), 4);
  assert.same(reads, 2);

  const changing = {
    __proto__: { value: 'pq' },
    get value() {
      // eslint-disable-next-line unicorn/no-accessor-recursion -- deletion invalidates this getter for the next read
      delete this.value;
      return [3, 4];
    },
  };
  const carrier = { changing };
  for (carrier.changing.value.at of [0]) assert.same(carrier.changing.value.at(-1), 'q');
});

QUnit.test('explicit literal slots retain their types beside unknown computed keys', assert => {
  function data(key) {
    const box = { rows: [8, 9], [key]: 0 };
    return box.rows.at(-1);
  }
  function getter(key) {
    const box = { get rows() { return [8, 9]; }, [key]: 0 };
    return box.rows.at(-1);
  }
  function paired(key) {
    const box = {
      get rows() { return [8, 9]; },
      // eslint-disable-next-line no-empty-function -- the setter only pairs with the getter
      set rows(value) {},
      [key]: 0,
    };
    return box.rows.at(-1);
  }
  assert.same(data('meta'), 9, 'data slot');
  assert.same(getter('meta'), 9, 'getter slot');
  assert.same(paired('meta'), 9, 'paired accessor slot');
});
