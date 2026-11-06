export function readArrayLevelCapture(input, events) {
  let at, includes;
  const result = { w: [{ [(events.push('at-key'), 'at')]: at, [(events.push('includes-key'), 'includes')]: includes }] }
    = { w: [input] };
  return [at, includes, result.w[0]];
}

export let storedArrayLevel;
export function readStoredArrayLevel(input, nested) {
  if (nested) {
    const [{ w: [{ includes: method }, tail] }] = [{ w: storedArrayLevel = [input, 0] }];
    return [method, tail];
  }
  const { w: [{ at: method }, tail] } = { w: storedArrayLevel = [input, 0] };
  return [method, tail];
}

QUnit.test('destructuring: array-level assignment keeps keys, getters and its original value', assert => {
  const events = [];
  const input = {
    get at() { events.push('at'); return 7; },
    get includes() { events.push('includes'); return 8; },
  };
  const [at, includes, original] = readArrayLevelCapture(input, events);
  assert.deepEqual([at, includes], [7, 8]);
  assert.same(original, input, 'the assignment yields the original receiver');
  assert.deepEqual(events, ['at-key', 'at', 'includes-key', 'includes']);
  const row = [10, 20];
  const [arrayAt, arrayIncludes] = readArrayLevelCapture(row, []);
  assert.same(arrayAt.call(row, -1), 20);
  assert.same(arrayIncludes.call(row, 20), true);
  const [stringAt, stringIncludes] = readArrayLevelCapture('1020', []);
  assert.same(stringAt.call('1020', -1), '0');
  assert.same(stringIncludes.call('1020', '02'), true);
  assert.same(readArrayLevelCapture({ at: undefined, includes: 9 }, [])[0], undefined,
    'an explicitly absent user method stays absent');
});

QUnit.test('destructuring: nested arrays keep discarded assignments and wrapped navigation live', assert => {
  let at, flat, tail;
  const value = ([[{ at, flat }]] = [[[1, [2]]]], 7);
  assert.same(value, 7);
  assert.same(at.call([3, 4], -1), 4);
  assert.deepEqual(flat.call([1, [2]]), [1, 2]);
  [{ w: [{ prototype: { at, flat } }] }, tail] = [{ w: [Array] }, 9];
  assert.same(tail, 9);
  assert.same(at.call([5, 6], -1), 6);
  assert.deepEqual(flat.call([3, [4]]), [3, 4]);
  const [{ w: [{ at: declaredAt, flat: declaredFlat }] }, other] = [{ w: [[7, [8]]] }, 11];
  assert.same(other, 11);
  assert.same(declaredAt.call([7, 8], -1), 8);
  assert.deepEqual(declaredFlat.call([7, [8]]), [7, 8]);
});

QUnit.test('destructuring: array levels in loop heads retain both instance reads', assert => {
  const events = [];
  // eslint-disable-next-line no-unreachable-loop -- one iteration exercises the declaration head
  for (const { w: [{ [(events.push('at'), 'at')]: at, [(events.push('flat'), 'flat')]: flat }] } of [{ w: [[1, [2]]] }]) {
    assert.same(at.call([1, 2], -1), 2);
    assert.deepEqual(flat.call([1, [2]]), [1, 2]);
    break;
  }
  assert.deepEqual(events, ['at', 'flat']);
  let at, flat;
  // eslint-disable-next-line no-unreachable-loop -- the assignment writes survive outside the body
  for ({ w: [{ at, flat }] } of [{ w: [[3, [4]]] }]) break;
  assert.same(at.call([3, 4], -1), 4);
  assert.deepEqual(flat.call([3, [4]]), [3, 4]);
});

QUnit.test('destructuring: an iterator pattern in an array keeps getters, defaults and throws in order', assert => {
  for (const mode of ['value', 'null', 'throw']) {
    const events = [];
    const source = {
      get [Symbol.iterator]() {
        events.push('iterator');
        if (mode === 'throw') throw new RangeError('iterator');
        return mode === 'null' ? null : function () { /* empty */ };
      },
      get tail() { events.push('tail'); return 3; },
    };
    let result;
    try {
      const [{ [Symbol.iterator]: { missing = (events.push('default'), 7) }, tail }] = [source];
      result = [missing, tail];
    } catch (error) { result = error.name; }
    assert.deepEqual(result, mode === 'value' ? [7, 3] : mode === 'null' ? 'TypeError' : 'RangeError', mode);
    assert.deepEqual(events, mode === 'value' ? ['iterator', 'default', 'tail'] : ['iterator'], mode);
  }
});

QUnit.test('destructuring: an inline stored array stays live between its element reads', assert => {
  for (const nested of [false, true]) {
    let calls = 0;
    function own() { return 7; }
    function read() {
      calls++;
      storedArrayLevel[1] = 9;
      return own;
    }
    const input = {
      get at() { return read(); },
      get includes() { return read(); },
    };
    const [method, tail] = readStoredArrayLevel(input, nested);
    assert.same(method, own, 'the own method is preserved');
    assert.same(tail, 9, 'the next position sees the preceding getter write');
    assert.same(calls, 1, 'the method getter runs once');
  }
});
