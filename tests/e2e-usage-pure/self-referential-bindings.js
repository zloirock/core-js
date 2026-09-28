// A binding read inside its own initializer holds nothing yet: the read is in its TDZ, or sees the
// hoisted `undefined`. The rewrite keeps that read, so the code throws where the source throws and
// yields what the source yields - nothing stands in for the missing value. The pipeline lowers lexical
// bindings without TDZ checks, so a throwing row asserts only that it throws, and the held `?.` rows
// use spellings that read `undefined` either way; the differential compares the unlowered errors.

/* eslint-disable prefer-const, new-cap, no-unsafe-optional-chaining -- the self-reading spellings are the forms under test */
QUnit.test('self-referential bindings: a pattern init reading its own binding', assert => {
  assert.throws(() => {
    const { at } = at;
    return at;
  });
  assert.throws(() => {
    let includes;
    ({ includes } = includes);
    return includes;
  });
  assert.throws(() => {
    const { map: first } = second,
          { filter: second } = first;
    return [first, second];
  });
});

QUnit.test('self-referential bindings: a nested shadow of a Symbol.X alias reading itself', assert => {
  const { iterator } = Symbol;
  assert.same(typeof [][iterator], 'function');
  assert.throws(() => {
    // eslint-disable-next-line no-shadow -- the shadow reading itself is the form under test
    const { iterator } = iterator;
    return iterator;
  });
});

QUnit.test('self-referential bindings: a pattern init calling its own binding', assert => {
  assert.throws(() => {
    const { at } = at();
    return at;
  });
  assert.throws(() => {
    const { includes } = includes?.();
    return includes;
  });
  assert.throws(() => {
    const { flat } = new flat();
    return flat;
  });
  assert.throws(() => {
    const { fill } = fill.call(null);
    return fill;
  });
  assert.throws(() => {
    const { map: first } = second(),
          { filter: second } = first();
    return [first, second];
  });
});

/* eslint-disable es/no-async-functions -- transpiled by babel */
QUnit.test('self-referential bindings: an awaited factory returning a call of its own binding', assert => {
  const async = assert.async();
  async function load() {
    async function make() {
      return at();
    }
    const { at } = await make();
    return at;
  }
  load().then(() => 'resolved', () => 'rejected').then(outcome => {
    assert.same(outcome, 'rejected');
    async();
  });
});
/* eslint-enable es/no-async-functions -- the rest is synchronous */

QUnit.test('self-referential bindings: a held `?.` read off its own binding', assert => {
  /* eslint-disable no-var -- a `var` reads its own hoisted `undefined`, the spelling that holds unlowered too */
  var copy = copy?.at;
  assert.same(copy, undefined);
  var first = second?.map,
      second = first?.filter;
  assert.same(second, undefined);
  /* eslint-enable no-var -- the rest are lexical */
  let held;
  held = held?.includes;
  assert.same(held?.flat(), undefined);
});
