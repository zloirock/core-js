var test = QUnit.test;

test('Object.seal', function (assert) {
  var seal = core.Object.seal;
  var keys = core.Object.keys;
  var getOwnPropertyNames = core.Object.getOwnPropertyNames;
  var getOwnPropertySymbols = core.Object.getOwnPropertySymbols;
  var ownKeys = core.Reflect.ownKeys;
  assert.isFunction(seal);
  assert.arity(seal, 1);
  var data = [42, 'foo', false, null, undefined, {}];
  for (var i = 0, length = data.length; i < length; ++i) {
    var value = data[i];
    assert.ok(function () {
      try {
        seal(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + {}.toString.call(value).slice(8, -1));
    assert.same(seal(value), value, 'returns target on ' + {}.toString.call(value).slice(8, -1));
  }
  var results = [];
  for (var key in seal({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(seal({})), []);
  assert.arrayEqual(getOwnPropertyNames(seal({})), []);
  assert.arrayEqual(getOwnPropertySymbols(seal({})), []);
  assert.arrayEqual(ownKeys(seal({})), []);
});
