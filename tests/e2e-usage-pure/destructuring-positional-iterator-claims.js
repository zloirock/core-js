// Babel's array fast path can discard an own iterator before post-only detection.
// Keep these source-order checks active in every leg that sees the original pattern.
const testBeforeLowering = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

testBeforeLowering('destructuring: a keyed array iterator serves its yielded receiver before the next value', assert => {
  const events = [];
  const first = [];
  Object.defineProperty(first, 'at', {
    get() {
      events.push('get:at');
      return function () { return this[this.length - 1]; };
    },
  });
  const row = [[], 0];
  let step = 0;
  row[Symbol.iterator] = function () {
    return {
      next() {
        const index = step++;
        events.push(`next:${ index }`);
        return index === 0 ? { value: first } : {
          get value() {
            events.push('get:tail');
            return 9;
          },
        };
      },
      return() {
        events.push('return');
        return {};
      },
    };
  };
  const { w: [{ at: method }, tail] } = { w: row };
  assert.same(method.call([1, 2], -1), 2);
  assert.same(tail, 9);
  assert.same(events.indexOf('get:at') < events.indexOf('get:tail'), true);
  assert.same(events.at(-1), 'return');
});

testBeforeLowering('destructuring: a keyed array iterator can yield a different instance family', assert => {
  const events = [];
  const row = [[], 0];
  row[Symbol.iterator] = function * () {
    yield 'abc';
    events.push('tail');
    yield 9;
  };
  const { w: [{ at: method }, tail] } = { w: row };
  assert.same(method.call('abc', -1), 'c');
  assert.same(tail, 9);
  assert.deepEqual(events, ['tail']);
});

testBeforeLowering('destructuring: an abrupt first instance claim closes the keyed array iterator', assert => {
  const events = [];
  const row = [[], 0];
  row[Symbol.iterator] = function () {
    return {
      next() {
        events.push('next');
        return { value: null };
      },
      return() {
        events.push('return');
        return {};
      },
    };
  };
  assert.throws(() => {
    const { w: [{ at: method }, tail] } = { w: row };
    return [method, tail];
  });
  assert.deepEqual(events, ['next', 'return']);
});
