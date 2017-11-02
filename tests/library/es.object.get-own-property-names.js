var test = QUnit.test;

test('Object.getOwnPropertyNames', function (assert) {
  var getOwnPropertyNames = core.Object.getOwnPropertyNames;
  assert.isFunction(getOwnPropertyNames);
  assert.arity(getOwnPropertyNames, 1);
  function F1() {
    this.w = 1;
  }
  function F2() {
    this.toString = 1;
  }
  F1.prototype.q = F2.prototype.q = 1;
  var names = getOwnPropertyNames([1, 2, 3]);
  assert.strictEqual(names.length, 4);
  assert.ok(includes(names, '0'));
  assert.ok(includes(names, '1'));
  assert.ok(includes(names, '2'));
  assert.ok(includes(names, 'length'));
  assert.deepEqual(getOwnPropertyNames(new F1()), ['w']);
  assert.deepEqual(getOwnPropertyNames(new F2()), ['toString']);
  assert.ok(includes(getOwnPropertyNames(Array.prototype), 'toString'));
  assert.ok(includes(getOwnPropertyNames(Object.prototype), 'toString'));
  assert.ok(includes(getOwnPropertyNames(Object.prototype), 'constructor'));
  var primitives = [42, 'foo', false];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        getOwnPropertyNames(value);
        return true;
      } catch (e) { /* empty */ }
    }, 'accept ' + typeof value);
  }
  assert['throws'](function () {
    getOwnPropertyNames(null);
  }, TypeError, 'throws on null');
  assert['throws'](function () {
    getOwnPropertyNames(undefined);
  }, TypeError, 'throws on undefined');
  if (global.document) {
    assert.ok(function () {
      try {
        var iframe = document.createElement('iframe');
        iframe.src = 'http://example.com';
        document.documentElement.appendChild(iframe);
        var window = iframe.contentWindow;
        document.documentElement.removeChild(iframe);
        return getOwnPropertyNames(window);
      } catch (e) { /* empty */ }
    }(), 'IE11 bug with iframe and window');
  }
});
