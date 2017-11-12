import { STRICT } from '../helpers/constants';

QUnit.test('String#matchAll', function (assert) {
  var matchAll = String.prototype.matchAll;
  var assign = Object.assign;
  assert.isFunction(matchAll);
  assert.arity(matchAll, 1);
  assert.name(matchAll, 'matchAll');
  assert.looksNative(matchAll);
  assert.nonEnumerable(String.prototype, 'matchAll');
  var data = ['aabc', { toString: function () {
    return 'aabc';
  } }];
  for (var i = 0, length = data.length; i < length; ++i) {
    var target = data[i];
    var iterator = matchAll.call(target, /[ac]/);
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.deepEqual(iterator.next(), {
      value: assign(['a'], {
        input: 'aabc',
        index: 0
      }),
      done: false
    });
    assert.deepEqual(iterator.next(), {
      value: assign(['a'], {
        input: 'aabc',
        index: 1
      }),
      done: false
    });
    assert.deepEqual(iterator.next(), {
      value: assign(['c'], {
        input: 'aabc',
        index: 3
      }),
      done: false
    });
    assert.deepEqual(iterator.next(), {
      value: null,
      done: true
    });
  }
  var iterator = '1111a2b3cccc'.matchAll(/(\d)(\D)/);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.deepEqual(iterator.next(), {
    value: assign(['1a', '1', 'a'], {
      input: '1111a2b3cccc',
      index: 3
    }),
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: assign(['2b', '2', 'b'], {
      input: '1111a2b3cccc',
      index: 5
    }),
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: assign(['3c', '3', 'c'], {
      input: '1111a2b3cccc',
      index: 7
    }),
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: null,
    done: true
  });
  var data = [null, undefined, 'qwe', NaN, 42, new Date(), {}, []];
  for (var i = 0, length = data.length; i < length; ++i) {
    var target = data[i];
    assert.throws(function () {
      ''.matchAll(target);
    }, TypeError, 'Throws on ' + target + ' as first argument');
  }
  if (STRICT) {
    assert.throws(function () {
      matchAll.call(null, /./);
    }, TypeError, 'Throws on null as `this`');
    assert.throws(function () {
      matchAll.call(undefined, /./);
    }, TypeError, 'Throws on undefined as `this`');
  }
});
