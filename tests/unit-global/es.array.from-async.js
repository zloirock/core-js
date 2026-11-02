import { createAsyncIterable, createIterable/* , createIterator */ } from '../helpers/helpers.js';
import { DESCRIPTORS, STRICT_THIS } from '../helpers/constants.js';

import ITERATOR from 'core-js-pure/es/symbol/iterator';
import ASYNC_ITERATOR from 'core-js-pure/es/symbol/async-iterator';

QUnit.test('Array.fromAsync', assert => {
  const { fromAsync } = Array;

  assert.isFunction(fromAsync);
  assert.arity(fromAsync, 1);
  assert.name(fromAsync, 'fromAsync');
  assert.looksNative(fromAsync);
  assert.nonEnumerable(Array, 'fromAsync');

  let counter = 0;
  // eslint-disable-next-line prefer-arrow-callback -- constructor
  fromAsync.call(function () {
    counter++;
    return [];
  }, { length: 0 });

  assert.same(counter, 1, 'proper number of constructor calling');

  function C() { /* empty */ }

  // const closableIterator = createIterator([1], {
  //   return() { this.closed = true; return { value: undefined, done: true }; },
  // });

  return fromAsync(createAsyncIterable([1, 2, 3]), it => it ** 2).then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'async iterable and mapfn');
    return fromAsync(createAsyncIterable([1]), function (arg, index) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(index, 0, 'index');
    });
  }).then(() => {
    return fromAsync(createAsyncIterable([1, 2, 3]));
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'async iterable without mapfn');
    return fromAsync(createIterable([1, 2, 3]), arg => arg ** 2);
  }).then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'iterable and mapfn');
    return fromAsync(createIterable([1, 2, 3]), arg => Promise.resolve(arg ** 2));
  }).then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'iterable and async mapfn');
    return fromAsync(createIterable([1]), function (arg, index) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(index, 0, 'index');
    });
  }).then(() => {
    return fromAsync(createIterable([1, 2, 3]));
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'iterable and without mapfn');
    return fromAsync([1, Promise.resolve(2), 3]);
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'array');
    return fromAsync('123');
  }).then(it => {
    assert.arrayEqual(it, ['1', '2', '3'], 'string');
    return fromAsync.call(C, [1]);
  }).then(it => {
    assert.true(it instanceof C, 'subclassable');
    return fromAsync({ length: 1, 0: 1 });
  }).then(it => {
    assert.arrayEqual(it, [1], 'non-iterable');
    return fromAsync(createIterable([1]), () => { throw 42; });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
    return fromAsync(undefined, () => { /* empty */ });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError);
    return fromAsync(null, () => { /* empty */ });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError);
    return fromAsync([1], null);
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError);
    return fromAsync([1], {});
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError);
    // sync iterable: return() should be called through AsyncFromSyncIterator on early termination
    const closable = createIterable([1, 2, 3], {
      return() {
        closable.closed = true;
        return { value: undefined, done: true };
      },
    });
    return fromAsync(closable, item => {
      if (item === 2) throw 42;
      return item;
    }).then(() => {
      assert.avoid();
    }, err => {
      assert.same(err, 42, 'sync iterable: rejection on callback error');
      assert.true(closable.closed, 'sync iterable: return() called on early termination');
    });
  });
  /* Tests are temporarily disabled due to the lack of proper async feature detection in native implementations.
  .then(() => {
    return fromAsync(Iterator.from(closableIterator), () => { throw 42; });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
    assert.true(closableIterator.closed, 'closes sync iterator on promise rejection');
  }); */
});

QUnit.test('Array.fromAsync, array-like length and mapping', assert => {
  const arrayLike = { 0: Promise.resolve(1), 1: 2, length: 2 };
  const receiver = {};
  function C(length) {
    assert.same(arguments.length, 1, 'one constructor argument');
    assert.same(length, 2, 'constructor receives the initial length');
    arrayLike.length = 3;
    arrayLike[2] = 3;
  }
  return Array.fromAsync.call(C, arrayLike, function (value, index) {
    assert.same(this, receiver, 'mapper receiver');
    assert.same(value, index + 1, 'element is awaited');
    return Promise.resolve(value * 2);
  }, receiver).then(result => {
    assert.true(result instanceof C, 'custom constructor');
    assert.same(result.length, 2, 'initial length is preserved');
    assert.same(result[0], 2, 'mapped value is awaited');
    assert.same(result[1], 4);
    assert.false(2 in result, 'does not visit added elements');
  });
});

if (DESCRIPTORS) QUnit.test('Array.fromAsync, array-like length is read once', assert => {
  const log = [];
  const arrayLike = Object.defineProperty({ 0: 1 }, 'length', {
    get() {
      log.push('length');
      return 1;
    },
  });
  function C() {
    log.push('construct');
  }
  return Array.fromAsync.call(C, arrayLike).then(result => {
    assert.arrayEqual(log, ['length', 'construct']);
    assert.same(result[0], 1);
    assert.same(result.length, 1);
  });
});

for (const [name, symbol, create] of [
  ['sync', ITERATOR, createIterable],
  ['async', ASYNC_ITERATOR, createAsyncIterable],
]) {
  QUnit.test(`Array.fromAsync, ${ name } iterator awaits primitive mapper results`, assert => {
    const values = [1, 2];
    return Array.fromAsync(create(values), (value, index) => {
      if (index === 0) Promise.resolve().then(() => { values[1] = 3; });
      return value;
    }).then(result => {
      assert.arrayEqual(result, [1, 3], 'awaits the mapper result before reading the next element');
    });
  });

  if (DESCRIPTORS) QUnit.test(`Array.fromAsync, ${ name } iterator initialization`, assert => {
    const log = [];
    const iterator = Object.defineProperty({}, 'next', {
      get() {
        log.push('next');
        return () => ({ done: true });
      },
      configurable: true,
    });
    const iterable = {
      [symbol]() {
        log.push('iterator');
        return iterator;
      },
    };
    function C() {
      log.push('construct');
      assert.same(arguments.length, 0, 'no constructor arguments');
      Object.defineProperty(iterator, 'next', {
        value() { assert.avoid('next method was already captured'); },
      });
    }
    return Array.fromAsync.call(C, iterable).then(result => {
      assert.arrayEqual(log, ['iterator', 'next', 'construct']);
      assert.same(result.length, 0);
    });
  });

  QUnit.test(`Array.fromAsync, ${ name } iterator step errors`, assert => {
    const phases = ['next', 'primitive'];
    if (DESCRIPTORS) phases.push('done', 'value');
    if (name === 'async') phases.push('rejection');
    return Promise.all(phases.map(phase => {
      let closed = 0;
      const error = new Error(phase);
      const iterable = create([], {
        next() {
          if (phase === 'next') throw error;
          if (phase === 'primitive') return name === 'async' ? Promise.resolve(1) : 1;
          if (phase === 'rejection') return Promise.reject(error);
          return Object.defineProperty({ done: false }, phase, { get() { throw error; } });
        },
        return() {
          closed++;
          return { done: true };
        },
      });
      return Array.fromAsync(iterable).then(() => {
        assert.avoid(phase);
      }, error_ => {
        if (phase === 'primitive') assert.true(error_ instanceof TypeError, phase);
        else assert.same(error_, error, phase);
        assert.same(closed, 0, `${ phase }: source is not closed`);
      });
    }));
  });

  QUnit.test(`Array.fromAsync, ${ name } iterator cleanup error`, assert => {
    let closed = 0;
    const error = new Error('mapper');
    const cleanupError = new Error('cleanup');
    const iterable = create([1], {
      return() {
        // Keep the regression bounded in engines that retry failed cleanup.
        if (++closed > 1) return { done: true };
        if (name === 'async') return Promise.reject(cleanupError);
        throw cleanupError;
      },
    });
    return Array.fromAsync(iterable, () => { throw error; }).then(() => {
      assert.avoid();
    }, error_ => {
      assert.same(error_, error, 'original error takes precedence');
      assert.same(closed, 1, 'closed only once');
    });
  });
}
