{module, test} = QUnit
module \ES6

if (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
  test 'RegExp constructor' (assert)->
    assert.isFunction RegExp
    assert.arity RegExp, 2
    assert.name RegExp, \RegExp
    assert.looksNative RegExp
    assert.strictEqual typeof! RegExp!, \RegExp
    assert.strictEqual typeof! new RegExp!, \RegExp
    re = /a/g
    assert.notStrictEqual re, new RegExp(re), 'new RegExp(re) isnt re'
    assert.strictEqual re, RegExp(re), 'RegExp(re) is re'
    re[Symbol?match] = no
    assert.notStrictEqual re, RegExp(re), 'RegExp(re) isnt re, changed Symbol.match'
    O = {}
    assert.notStrictEqual O, RegExp(O), 'RegExp(O) isnt O'
    O[Symbol?match] = on
    O.constructor = RegExp
    assert.strictEqual O, RegExp(O), 'RegExp(O) is O, changed Symbol.match'
    assert.strictEqual String(re), '/a/g', 'b is /a/g'
    # allows a regex with flags as the pattern
    assert.strictEqual String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags'
    assert.ok new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof'
    assert.strictEqual new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor'
    /(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)/.exec \abcdefghijklmnopq
    for val, index in \bcdefghij
      assert.strictEqual RegExp"$#{index + 1}", val, "Updates RegExp globals $#{index + 1}"