import { STRICT } from '../helpers/constants';

import matchAll from 'core-js-pure/fn/string/match-all';
import assign from 'core-js-pure/fn/object/assign';

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
      value: null,
      done: true,
    });
  }
  let iterator = matchAll('1111a2b3cccc', /(\d)(\D)/g);
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
  iterator = matchAll('1111a2b3cccc', /(\d)(\D)/);
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
    value: null,
    done: true,
  });
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
    value: null,
    done: true,
  });
  data = [null, undefined, NaN, 42, {}, []];
  for (const target of data) {
    assert.notThrows(() => matchAll('', target), `Not throws on ${ target } as the first argument`);
  }
  if (STRICT) {
    assert.throws(() => matchAll(null, /./g), TypeError, 'Throws on null as `this`');
    assert.throws(() => matchAll(undefined, /./g), TypeError, 'Throws on undefined as `this`');
  }
});
