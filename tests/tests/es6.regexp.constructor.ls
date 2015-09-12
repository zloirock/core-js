{module, test} = QUnit
module \ES6

if (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
  test 'RegExp constructor' (assert)->
    assert.ok typeof! RegExp is \Function, 'RegExp is function'
    assert.strictEqual RegExp.length, 2, 'RegExp.length is 2'
    assert.ok /native code/.test(RegExp), 'looks like native'
    assert.strictEqual RegExp.name, \RegExp, 'RegExp.name is "RegExp" (can fail if compressed)'
    a = /a/g
    assert.ok typeof! RegExp! is \RegExp
    assert.ok typeof! new RegExp! is \RegExp
    b = new RegExp a
    assert.ok a isnt b, 'a isnt b'
    c = RegExp a
    assert.ok a is c, 'a is c'
    assert.strictEqual String(b), '/a/g', 'b is /a/g'
    # allows a regex with flags as the pattern
    assert.strictEqual String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags'
    assert.ok new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof'
    assert.strictEqual new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor'
    /(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)/.exec \abcdefghijklmnopq
    for val, index in \bcdefghij
      assert.strictEqual RegExp"$#{index + 1}", val, "Updates RegExp globals $#{index + 1}"