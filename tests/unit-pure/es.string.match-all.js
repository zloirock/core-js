import Symbol from '@core-js/pure/es/symbol';
import assign from '@core-js/pure/es/object/assign';
import matchAll from '@core-js/pure/es/string/match-all';

QUnit.test('String#matchAll', assert => {
  assert.isFunction(matchAll);
  let data = ['aabc', { toString() {
    return 'aabc';
  } }];
  for (const target of data) {
    const iterator = matchAll(target, /[ac]/g);
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.deepEqual(iterator.next(), {
      value: assign(['a'], {
        input: 'aabc',
        index: 0,
      }),
      done: false,
    });
    assert.deepEqual(iterator.next(), {
      value: assign(['a'], {
        input: 'aabc',
        index: 1,
      }),
      done: false,
    });
    assert.deepEqual(iterator.next(), {
      value: assign(['c'], {
        input: 'aabc',
        index: 3,
      }),
      done: false,
    });
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true,
    });
  }
  let iterator = matchAll('1111a2b3cccc', /(\d)(\D)/g);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'RegExp String Iterator');
  assert.same(String(iterator), '[object RegExp String Iterator]');
  assert.deepEqual(iterator.next(), {
    value: assign(['1a', '1', 'a'], {
      input: '1111a2b3cccc',
      index: 3,
    }),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: assign(['2b', '2', 'b'], {
      input: '1111a2b3cccc',
      index: 5,
    }),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: assign(['3c', '3', 'c'], {
      input: '1111a2b3cccc',
      index: 7,
    }),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  assert.throws(() => matchAll('1111a2b3cccc', /(\d)(\D)/), TypeError);
  iterator = matchAll('1111a2b3cccc', '(\\d)(\\D)');
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.deepEqual(iterator.next(), {
    value: assign(['1a', '1', 'a'], {
      input: '1111a2b3cccc',
      index: 3,
    }),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: assign(['2b', '2', 'b'], {
      input: '1111a2b3cccc',
      index: 5,
    }),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: assign(['3c', '3', 'c'], {
      input: '1111a2b3cccc',
      index: 7,
    }),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  /* IE8- issue
  iterator = matchAll('abc', /\B/g);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.deepEqual(iterator.next(), {
    value: assign([''], {
      input: 'abc',
      index: 1,
    }),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: assign([''], {
      input: 'abc',
      index: 2,
    }),
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  */
  data = [null, undefined, NaN, 42, {}, []];
  for (const target of data) {
    assert.notThrows(() => matchAll('', target), `Not throws on ${ target } as the first argument`);
  }

  assert.throws(() => matchAll(Symbol('matchAll test'), /./), 'throws on symbol context');

  assert.throws(() => matchAll(null, /./g), TypeError, 'Throws on null as `this`');
  assert.throws(() => matchAll(undefined, /./g), TypeError, 'Throws on undefined as `this`');
});
