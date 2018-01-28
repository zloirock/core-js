import { STRICT } from '../helpers/constants';

QUnit.test('String#matchAll', assert => {
  const { matchAll } = String.prototype;
  const { assign } = Object;
  assert.isFunction(matchAll);
  assert.arity(matchAll, 1);
  assert.name(matchAll, 'matchAll');
  assert.looksNative(matchAll);
  assert.nonEnumerable(String.prototype, 'matchAll');
  let data = ['aabc', { toString() { return 'aabc'; } }];
  for (const target of data) {
    const iterator = matchAll.call(target, /[ac]/g);
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
      value: null,
      done: true,
    });
  }
  let iterator = '1111a2b3cccc'.matchAll(/(\d)(\D)/g);
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
    value: null,
    done: true,
  });
  iterator = '1111a2b3cccc'.matchAll(/(\d)(\D)/);
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
    value: null,
    done: true,
  });
  iterator = '1111a2b3cccc'.matchAll('(\\d)(\\D)');
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
    value: null,
    done: true,
  });
  iterator = 'abc'.matchAll(/\B/g);
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
    value: null,
    done: true,
  });
  data = [null, undefined, NaN, 42, {}, []];
  for (const target of data) {
    assert.notThrows(() => ''.matchAll(target), `Not throws on ${ target } as the first argument`);
  }
  if (STRICT) {
    assert.throws(() => matchAll.call(null, /./g), TypeError, 'Throws on null as `this`');
    assert.throws(() => matchAll.call(undefined, /./g), TypeError, 'Throws on undefined as `this`');
  }
});
