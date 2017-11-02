var test = QUnit.test;

test('Object.freeze', function (assert) {
  var freeze = core.Object.freeze;
  var keys = core.Object.keys;
  var getOwnPropertyNames = core.Object.getOwnPropertyNames;
  var getOwnPropertySymbols = core.Object.getOwnPropertySymbols;
  var ownKeys = core.Reflect.ownKeys;
  assert.isFunction(freeze);
  assert.arity(freeze, 1);
  var data = [42, 'foo', false, null, undefined, {}];
  for (var i = 0, length = data.length; i < length; ++i) {
    var value = data[i];
    assert.ok(function () {
      try {
        freeze(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + {}.toString.call(value).slice(8, -1));
    assert.same(freeze(value), value, 'returns target on ' + {}.toString.call(value).slice(8, -1));
  }
  var results = [];
  for (var key in freeze({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(freeze({})), []);
  assert.arrayEqual(getOwnPropertyNames(freeze({})), []);
  assert.arrayEqual(getOwnPropertySymbols(freeze({})), []);
  assert.arrayEqual(ownKeys(freeze({})), []);
});
