QUnit.test('optional chain: a method getter cannot replace the captured call receiver', assert => {
  let arr = [['outer']];
  const after = [['inner']];
  const events = [];
  Object.defineProperty(arr, 'at', {
    get() {
      events.push('get');
      arr = after;
      return function () {
        events.push(this[0][0]);
        return this[0];
      };
    },
  });
  let hits = 0;
  // eslint-disable-next-line no-sequences -- count the guarded computed-key read
  const result = arr?.at?.(0)?.[hits++, 'includes']('outer');
  assert.same(result, true);
  assert.same(hits, 1);
  assert.same(arr, after);
  assert.deepEqual(events, ['get', 'outer']);
});

QUnit.test('optional chain: readonly getter and quiet data receivers retain this', assert => {
  const arr = [['outer']];
  let reads = 0;
  Object.defineProperty(arr, 'at', {
    get() {
      reads++;
      return function () { return this[0]; };
    },
  });
  assert.same(arr?.at?.(0)?.includes('outer'), true);
  assert.same(reads, 1);

  const quiet = [['quiet']];
  assert.same(quiet?.at?.(0)?.includes('quiet'), true);
});

QUnit.test('optional call: a method getter keeps the original receiver without a receiver guard', assert => {
  let arr = [['outer']];
  const after = [['inner']];
  let reads = 0;
  Object.defineProperty(arr, 'at', {
    get() {
      reads++;
      arr = after;
      return function () { return this[0]; };
    },
  });
  let hits = 0;
  // eslint-disable-next-line no-sequences -- count the guarded computed-key read
  const result = arr.at?.(0)?.[hits++, 'includes']('outer');
  assert.same(result, true);
  assert.same(reads, 1);
  assert.same(hits, 1);
  assert.same(arr, after);
});

QUnit.test('optional call: quoted method getters retain the original receiver', assert => {
  let arr = [['outer']];
  const after = [['inner']];
  Object.defineProperty(arr, 'at', {
    get() {
      arr = after;
      return function () { return this[0]; };
    },
  });
  // eslint-disable-next-line dot-notation -- exercise a quiet computed method key
  assert.same(arr?.['at']?.(0)?.includes('outer'), true);
  assert.same(arr, after);

  let other = [['first']];
  const later = [['second']];
  Object.defineProperty(other, 'at', {
    get() {
      other = later;
      return function () { return this[0]; };
    },
  });
  // eslint-disable-next-line dot-notation -- exercise a quiet computed method key
  assert.same(other['at']?.(0)?.includes('first'), true);
  assert.same(other, later);
});

QUnit.test('optional chain: null receiver or getter result skips later keys and calls', assert => {
  const nil = null;
  let hits = 0;
  // eslint-disable-next-line no-sequences -- count the skipped computed-key read
  assert.same(nil?.at?.(0)?.[hits++, 'includes']('outer'), undefined);
  assert.same(hits, 0);

  const arr = [['outer']];
  let reads = 0;
  Object.defineProperty(arr, 'at', {
    get() { reads++; return null; },
  });
  // eslint-disable-next-line no-sequences -- count the skipped computed-key read
  assert.same(arr?.at?.(0)?.[hits++, 'includes']('outer'), undefined);
  assert.same(reads, 1);
  assert.same(hits, 0);
});

QUnit.test('optional call: an effectful computed key precedes the getter on the captured receiver', assert => {
  let arr = [['outer']];
  const after = [['inner']];
  const events = [];
  Object.defineProperty(arr, 'at', {
    get() {
      events.push('method');
      return function () { return this[0]; };
    },
  });
  const key = {
    get value() {
      events.push('key');
      arr = after;
      return 'at';
    },
  };
  assert.same(arr?.[key.value]?.(0)?.includes('outer'), true);
  assert.same(arr, after);
  assert.deepEqual(events, ['key', 'method']);
});

QUnit.test('optional iterator call: a getter cannot replace the captured call receiver', assert => {
  let arr = ['outer'];
  const after = ['inner'];
  const events = [];
  Object.defineProperty(arr, Symbol.iterator, {
    get() {
      events.push('get');
      arr = after;
      return function () {
        // eslint-disable-next-line prefer-destructuring -- avoid invoking this iterator recursively
        const value = this[0];
        events.push(value);
        return { next() { return { value, done: false }; } };
      };
    },
  });
  const result = arr?.[Symbol.iterator]?.().next().value;
  assert.same(result, 'outer');
  assert.same(arr, after);
  assert.deepEqual(events, ['get', 'outer']);
});

QUnit.test('optional iterator call: readonly and null receivers keep the guards', assert => {
  const arr = ['outer'];
  let reads = 0;
  Object.defineProperty(arr, Symbol.iterator, {
    get() {
      reads++;
      return function () {
        // eslint-disable-next-line prefer-destructuring -- avoid invoking this iterator recursively
        const value = this[0];
        return { next() { return { value, done: false }; } };
      };
    },
  });
  assert.same(arr?.[Symbol.iterator]?.().next().value, 'outer');
  assert.same(reads, 1);

  const quiet = ['quiet'];
  assert.same(quiet?.[Symbol.iterator]?.().next().value, 'quiet');
  const absent = ['absent'];
  let absentReads = 0;
  Object.defineProperty(absent, Symbol.iterator, {
    get() { absentReads++; return null; },
  });
  // Without a native array iterator, the pure helper supplies its class fallback.
  const nativeArrayIterator = Object.getOwnPropertyDescriptor(Array.prototype, Symbol.iterator)?.value;
  assert.same(absent?.[Symbol.iterator]?.().next().value, nativeArrayIterator ? undefined : 'absent');
  assert.same(absentReads, 1);
  const nonIterable = {};
  let nonIterableReads = 0;
  Object.defineProperty(nonIterable, Symbol.iterator, {
    get() { nonIterableReads++; return null; },
  });
  assert.same(nonIterable?.[Symbol.iterator]?.().next().value, undefined);
  assert.same(nonIterableReads, 1);
  const nil = null;
  let hits = 0;
  // eslint-disable-next-line no-sequences -- count the skipped computed-key read
  assert.same(nil?.[hits++, Symbol.iterator]?.().next().value, undefined);
  assert.same(hits, 0);
});
