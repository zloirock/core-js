var test = QUnit.test;

test('Array.from', function (assert) {
  var from = core.Array.from;
  var Symbol = core.Symbol;
  var defineProperty = core.Object.defineProperty;
  assert.isFunction(from);
  assert.arity(from, 1);
  var types = {
    'array-like': {
      length: '3',
      0: '1',
      1: '2',
      2: '3'
    },
    arguments: function () {
      return arguments;
    }('1', '2', '3'),
    array: ['1', '2', '3'],
    iterable: createIterable(['1', '2', '3']),
    string: '123'
  };
  for (var typ in types) {
    var data = types[typ];
    assert.arrayEqual(from(data), ['1', '2', '3'], 'Works with ' + typ);
    assert.arrayEqual(from(data, function (it) {
      return Math.pow(it, 2);
    }), [1, 4, 9], 'Works with ' + typ + ' + mapFn');
  }
  types = {
    'array-like': {
      length: 1,
      0: 1
    },
    arguments: function () {
      return arguments;
    }(1),
    array: [1],
    iterable: createIterable([1]),
    string: '1'
  };
  for (var typ in types) {
    var data = types[typ];
    var context = {};
    assert.arrayEqual(from(data, function (value, key) {
      assert.same(this, context, 'Works with ' + typ + ', correct callback context');
      assert.same(value, typ === 'string' ? '1' : 1, 'Works with ' + typ + ', correct callback key');
      assert.same(key, 0, 'Works with ' + typ + ', correct callback value');
      assert.same(arguments.length, 2, 'Works with ' + typ + ', correct callback arguments number');
      return 42;
    }, context), [42], 'Works with ' + typ + ', correct result');
  }
  var primitives = [false, true, 0];
  for (var i = 0; i < 3; ++i) {
    var primitive = primitives[i];
    assert.arrayEqual(from(primitive), [], 'Works with ' + primitive);
  }
  assert['throws'](function () {
    from(null);
  }, TypeError, 'Throws on null');
  assert['throws'](function () {
    from(undefined);
  }, TypeError, 'Throws on undefined');
  assert.arrayEqual(from('𠮷𠮷𠮷'), ['𠮷', '𠮷', '𠮷'], 'Uses correct string iterator');
  var done = true;
  from(createIterable([1, 2, 3], {
    'return': function () {
      return done = false;
    }
  }), function () {
    return false;
  });
  assert.ok(done, '.return #default');
  done = false;
  try {
    from(createIterable([1, 2, 3], {
      'return': function () {
        return done = true;
      }
    }), function () {
      throw new Error();
    });
  } catch (e) { /* empty */ }
  assert.ok(done, '.return #throw');
  function F() { /* empty */ }
  var instance = from.call(F, createIterable([1, 2]));
  assert.ok(instance instanceof F, 'generic, iterable case, instanceof');
  assert.arrayEqual(instance, [1, 2], 'generic, iterable case, elements');
  instance = from.call(F, {
    0: 1,
    1: 2,
    length: 2
  });
  assert.ok(instance instanceof F, 'generic, array-like case, instanceof');
  assert.arrayEqual(instance, [1, 2], 'generic, array-like case, elements');
  var array = [1, 2, 3];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return core.getIteratorMethod([]).call(this);
  };
  assert.arrayEqual(from(array), [1, 2, 3], 'Array with custom iterator, elements');
  assert.ok(done, 'call @@iterator in Array with custom iterator');
  array = [1, 2, 3];
  delete array[1];
  assert.arrayEqual(from(array, String), ['1', 'undefined', '3'], 'Ignores holes');
  assert.ok(function () {
    try {
      return from({
        length: -1,
        0: 1
      }, function () {
        throw new Error();
      });
    } catch (e) { /* empty */ }
  }(), 'Uses ToLength');
  assert.arrayEqual(from([], undefined), [], 'Works with undefined as asecond argument');
  assert['throws'](function () {
    from([], null);
  }, TypeError, 'Throws with null as second argument');
  assert['throws'](function () {
    from([], 0);
  }, TypeError, 'Throws with 0 as second argument');
  assert['throws'](function () {
    from([], '');
  }, TypeError, 'Throws with "" as second argument');
  assert['throws'](function () {
    from([], false);
  }, TypeError, 'Throws with false as second argument');
  assert['throws'](function () {
    from([], {});
  }, TypeError, 'Throws with {} as second argument');
  if (DESCRIPTORS) {
    var called = false;
    defineProperty(F.prototype, 0, {
      set: function () {
        called = true;
      }
    });
    from.call(F, [1, 2, 3]);
    assert.ok(!called, 'Should not call prototype accessors');
  }
});
