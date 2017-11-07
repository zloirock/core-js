var test = QUnit.test;
var Symbol = global.Symbol || {};

test('String#includes', function (assert) {
  var includes = String.prototype.includes;
  assert.isFunction(includes);
  assert.arity(includes, 1);
  assert.name(includes, 'includes');
  assert.looksNative(includes);
  assert.nonEnumerable(String.prototype, 'includes');
  assert.ok(!'abc'.includes());
  assert.ok('aundefinedb'.includes());
  assert.ok('abcd'.includes('b', 1));
  assert.ok(!'abcd'.includes('b', 2));
  if (STRICT) {
    assert['throws'](function () {
      String.prototype.includes.call(null, '.');
    }, TypeError);
    assert['throws'](function () {
      String.prototype.includes.call(undefined, '.');
    }, TypeError);
  }
  var regexp = /./;
  assert['throws'](function () {
    '/./'.includes(regexp);
  }, TypeError);
  regexp[Symbol.match] = false;
  assert.ok(function () {
    try {
      return '/./'.includes(regexp);
    } catch (e) { /* empty */ }
  }());
  var object = {};
  assert.ok(function () {
    try {
      return '[object Object]'.includes(object);
    } catch (e) { /* empty */ }
  }());
  object[Symbol.match] = true;
  assert['throws'](function () {
    '[object Object]'.includes(object);
  }, TypeError);
});
