var test = QUnit.test;

test('Date#@@toPrimitive', function (assert) {
  var toPrimitive = Date.prototype[Symbol.toPrimitive];
  assert.isFunction(toPrimitive);
  assert.arity(toPrimitive, 1);
  assert.nonEnumerable(Date.prototype, Symbol.toPrimitive);
  var date = new Date();
  assert.same(date[Symbol.toPrimitive]('string'), date.toString(), 'generic, hint "string"');
  assert.same(date[Symbol.toPrimitive]('number'), +date, 'generic, hint "number"');
  assert.same(date[Symbol.toPrimitive]('default'), date.toString(), 'generic, hint "default"');
  assert.same(toPrimitive.call(Object(2), 'string'), '2', 'generic, hint "string"');
  assert.same(toPrimitive.call(Object(2), 'number'), 2, 'generic, hint "number"');
  assert.same(toPrimitive.call(Object(2), 'default'), '2', 'generic, hint "default"');
  var data = [undefined, '', 'foo', { toString: function () { return 'string'; } }];
  for (var i = 0, length = data.length; i < length; ++i) {
    assert['throws'](function () {
      new Date()[Symbol.toPrimitive](data[i]);
    }, TypeError, 'throws on ' + data[i] + ' as a hint');
  }
  if (STRICT) {
    data = [1, false, 'string', null, undefined];
    for (var i = 0, length = data.length; i < length; ++i) {
      assert['throws'](function () {
        toPrimitive.call(data[i], 'string');
      }, TypeError, 'throws on ' + data[i] + ' as `this`');
    }
  }
});
