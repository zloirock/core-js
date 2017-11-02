var test = QUnit.test;

test('String#matchAll', function (assert) {
  var matchAll = core.String.matchAll;
  var assign = core.Object.assign;
  assert.isFunction(matchAll);
  var data = ['aabc', { toString: function () {
    return 'aabc';
  } }];
  for (var i = 0, length = data.length; i < length; ++i) {
    var target = data[i];
    var iterator = matchAll(target, /[ac]/);
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
  var iterator = matchAll('1111a2b3cccc', /(\d)(\D)/);
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
    assert['throws'](function () {
      matchAll('', target);
    }, TypeError, 'Throws on ' + target + ' as first argument');
  }
  if (STRICT) {
    var data = [null, undefined];
    for (var i = 0, length = data.length; i < length; ++i) {
      var target = data[i];
      assert['throws'](function () {
        matchAll(target, /./);
      }, TypeError, 'Throws on ' + target + ' as `this`');
    }
  }
});
