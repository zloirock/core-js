var test = QUnit.test;

test('String#startsWith', function (assert) {
  var startsWith = core.String.startsWith;
  var Symbol = core.Symbol;
  assert.isFunction(startsWith);
  assert.ok(startsWith('undefined'));
  assert.ok(!startsWith('undefined', null));
  assert.ok(startsWith('abc', ''));
  assert.ok(startsWith('abc', 'a'));
  assert.ok(startsWith('abc', 'ab'));
  assert.ok(!startsWith('abc', 'bc'));
  assert.ok(startsWith('abc', '', NaN));
  assert.ok(startsWith('abc', 'a', -1));
  assert.ok(!startsWith('abc', 'a', 1));
  assert.ok(!startsWith('abc', 'a', Infinity));
  assert.ok(startsWith('abc', 'b', true));
  assert.ok(startsWith('abc', 'a', 'x'));
  if (STRICT) {
    assert['throws'](function () {
      startsWith(null, '.');
    }, TypeError);
    assert['throws'](function () {
      startsWith(undefined, '.');
    }, TypeError);
  }
  var regexp = /./;
  assert['throws'](function () {
    startsWith('/./', regexp);
  }, TypeError);
  regexp[Symbol.match] = false;
  assert.ok(function () {
    try {
      return startsWith('/./', regexp);
    } catch (e) { /* empty */ }
  }());
  var object = {};
  assert.ok(function () {
    try {
      return startsWith('[object Object]', object);
    } catch (e) { /* empty */ }
  }());
  object[Symbol.match] = true;
  assert['throws'](function () {
    startsWith('[object Object]', object);
  }, TypeError);
});
