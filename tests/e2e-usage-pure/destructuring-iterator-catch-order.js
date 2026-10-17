// Relocated catch patterns keep a single iterator read before their nested default and sibling.
function readCaughtIterator(input, events) {
  try {
    throw input;
  } catch ({ [Symbol.iterator]: { missing = (events.push('default'), 7) }, tail }) {
    return [missing, tail];
  }
}

function readCaughtIteratorWithKeyEffect(input, events) {
  try {
    throw input;
  } catch ({ [(events.push('key'), Symbol.iterator)]: { missing = (events.push('default'), 7) }, tail }) {
    return [missing, tail];
  }
}

function readCaughtIteratorWithRest(input, events) {
  try {
    throw input;
  } catch ({ [Symbol.iterator]: { missing = (events.push('default'), 7) }, tail, ...rest }) {
    return [missing, tail, rest];
  }
}

for (const [shape, read] of [
  ['sibling', readCaughtIterator],
  ['key effect', readCaughtIteratorWithKeyEffect],
  ['rest', readCaughtIteratorWithRest],
]) {
  for (const mode of ['value', 'null', 'throw']) {
    QUnit.test(`destructuring: caught iterator pattern keeps its ordered read (${ shape }, ${ mode })`, assert => {
      const events = [];
      const source = {
        get [Symbol.iterator]() {
          events.push('iterator');
          if (mode === 'throw') throw new RangeError('iterator');
          return mode === 'null' ? null : function () { /* empty */ };
        },
        get tail() { events.push('tail'); return 3; },
        other: 4,
      };
      const prefix = shape === 'key effect' ? ['key'] : [];
      if (mode === 'value') {
        // Warm the native rest shape on engines that repeat excluded getters on their first read.
        read(source, events);
        events.length = 0;
        const result = read(source, events);
        assert.same(result[0], 7);
        assert.same(result[1], 3);
        if (shape === 'rest') {
          assert.same(result[2].other, 4);
          assert.same(Object.getOwnPropertyDescriptor(result[2], Symbol.iterator), undefined);
        }
        assert.deepEqual(events, [...prefix, 'iterator', 'default', 'tail']);
      } else {
        assert.throws(() => read(source, events));
        assert.deepEqual(events, [...prefix, 'iterator']);
      }
    });
  }
}
