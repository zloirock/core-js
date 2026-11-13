// Computed parameter keys keep their outer binding when the pattern moves into a body.
const K = 'at';
export function read({ [K]: at }) {
  // eslint-disable-next-line no-shadow -- the parameter key must not observe this body binding
  const K = 'length';
  return [at.call([3, 7], -1), K];
}
export function readDefault({ [K]: at = null }) {
  return at === null ? 'default' : at.call([3, 7], -1);
}
export function readNested(source) {
  const key = 'row';
  const [{ [key]: { at }, marker }] = source;
  return [at.call([3, 7], -1), marker];
}

QUnit.test('computed pattern keys: parameter scope and leaf defaults', assert => {
  assert.deepEqual(read([3, 7]), [7, 'length']);
  assert.same(readDefault([3, 7]), 7);
  assert.same(readDefault({}), 'default');
  let reads = 0;
  assert.same(readDefault({ get at() {
    reads++;
    return undefined;
  } }), 'default');
  assert.same(reads, 1, 'the default guard reads a getter once');
});

QUnit.test('computed pattern keys: captured elements keep their siblings', assert => {
  assert.deepEqual(readNested([{ row: [3, 7], marker: 9 }]), [7, 9]);
  const events = [];
  function * source() {
    try {
      events.push('next');
      yield [3, 7];
    } finally {
      events.push('close');
    }
  }
  const [{ [K]: at, length }] = source();
  assert.same(at.call([3, 7], -1), 7);
  assert.same(length, 2);
  assert.deepEqual(events, ['next', 'close']);
  const key = 'row';
  const rows = [{ row: [3, 7] }];
  let capturedAt;
  // eslint-disable-next-line prefer-const -- exercise assignment capture separately from declarations
  [{ [key]: { at: capturedAt } }] = rows;
  assert.same(capturedAt.call([3, 7], -1), 7);
});

QUnit.test('computed pattern keys: a hoisted function cannot erase key initialization', assert => {
  // ES5 lowering omits TDZ checks; runtime and differential tests retain the native ReferenceError.
  assert.throws(() => consume([3, 7]), TypeError);
  const key = 'at';
  function consume({ [key]: at }) {
    return at.call([3, 7], -1);
  }
  assert.same(consume([3, 7]), 7);
});
