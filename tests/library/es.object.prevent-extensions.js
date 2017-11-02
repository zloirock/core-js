var test = QUnit.test;

test('Object.preventExtensions', function (assert) {
  var preventExtensions = core.Object.preventExtensions;
  var keys = core.Object.keys;
  var getOwnPropertyNames = core.Object.getOwnPropertyNames;
  var getOwnPropertySymbols = core.Object.getOwnPropertySymbols;
  var ownKeys = core.Reflect.ownKeys;
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  var data = [42, 'foo', false, null, undefined, {}];
  for (var i = 0, length = data.length; i < length; ++i) {
    var value = data[i];
    assert.ok(function () {
      try {
        preventExtensions(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + {}.toString.call(value).slice(8, -1));
    assert.same(preventExtensions(value), value, 'returns target on ' + {}.toString.call(value).slice(8, -1));
  }
  var results = [];
  for (var key in preventExtensions({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(preventExtensions({})), []);
  assert.arrayEqual(getOwnPropertyNames(preventExtensions({})), []);
  assert.arrayEqual(getOwnPropertySymbols(preventExtensions({})), []);
  assert.arrayEqual(ownKeys(preventExtensions({})), []);
});
