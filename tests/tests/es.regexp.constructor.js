var test = QUnit.test;

if (DESCRIPTORS) {
  test('RegExp constructor', function (assert) {
    var Symbol = global.Symbol || {};
    assert.isFunction(RegExp);
    assert.arity(RegExp, 2);
    assert.name(RegExp, 'RegExp');
    assert.looksNative(RegExp);
    assert.ok({}.toString.call(RegExp()).slice(8, -1), 'RegExp');
    assert.ok({}.toString.call(new RegExp()).slice(8, -1), 'RegExp');
    var regexp = /a/g;
    assert.notStrictEqual(regexp, new RegExp(regexp), 'new RegExp(regexp) isnt regexp');
    assert.strictEqual(regexp, RegExp(regexp), 'RegExp(regexp) is regexp');
    regexp[Symbol.match] = false;
    assert.notStrictEqual(regexp, RegExp(regexp), 'RegExp(regexp) isnt regexp, changed Symbol.match');
    var object = {};
    assert.notStrictEqual(object, RegExp(object), 'RegExp(O) isnt O');
    object[Symbol.match] = true;
    object.constructor = RegExp;
    assert.strictEqual(object, RegExp(object), 'RegExp(O) is O, changed Symbol.match');
    assert.strictEqual(String(regexp), '/a/g', 'b is /a/g');
    assert.strictEqual(String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags');
    assert.ok(new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof');
    assert.strictEqual(new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor');
    /(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)/.exec('abcdefghijklmnopq');
    var result = true;
    var characters = 'bcdefghij';
    for (var i = 0, length = characters.length; i < length; ++i) {
      var chr = characters[i];
      if (RegExp['$' + (i + 1)] !== chr) {
        result = false;
      }
    }
    assert.ok(result, 'Updates RegExp globals');
    if (nativeSubclass) {
      var Subclass = nativeSubclass(RegExp);
      assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
      assert.ok(new Subclass() instanceof RegExp, 'correct subclassing with native classes #2');
      assert.ok(new Subclass('^abc$').test('abc'), 'correct subclassing with native classes #3');
    }
  });
}
