// Exported callers cannot narrow this receiver to the test's object literal.
export function readDefaultSource(source, events) {
  const { at: read = (events.push('default'), Array.from), [(events.push('key'), 'other')]: other } = source;
  return [read({ 0: 7, length: 1 }), other];
}

QUnit.test('destructuring: a live default follows its getter and precedes the next key', assert => {
  const events = [];
  function source() {
    events.push('init');
    return {
      get at() { events.push('get'); return undefined; },
      get other() { events.push('other'); return 3; },
    };
  }
  assert.deepEqual(readDefaultSource(source(), events), [[7], 3]);
  assert.deepEqual(events, ['init', 'get', 'default', 'key', 'other']);
});

QUnit.test('destructuring: a loop sink runs once and a static default stays dead', assert => {
  const events = [];
  let result;
  // eslint-disable-next-line no-var -- exercise the var loop-header sink
  for (var { from: read = (events.push('dead'), null) } = (events.push('init'), Array) ?? Set; result === undefined;) {
    result = read([4, 6]);
  }
  assert.deepEqual(result, [4, 6]);
  assert.deepEqual(events, ['init']);
});

QUnit.test('destructuring: a consumed inner assignment keeps its write before the outer binding', assert => {
  const events = [];
  const target = { set read(value) { events.push(value([2])[0]); } };
  let read;
  // eslint-disable-next-line prefer-const -- exercise two consumed assignment hosts
  ({ from: read } = { from: target.read } = (events.push('init'), Array));
  assert.deepEqual(read([5]), [5]);
  assert.deepEqual(events, ['init', 2]);
});

QUnit.test('destructuring: a throwing getter does not run its default or later key', assert => {
  const events = [];
  const failure = {};
  let caught;
  try {
    const { at: read = (events.push('default'), Array.from), [(events.push('key'), 'other')]: other } = {
      get at() { events.push('get'); throw failure; }, other: 3,
    };
    events.push(read, other);
  } catch (error) { caught = error; }
  assert.same(caught, failure);
  assert.deepEqual(events, ['get']);
});
