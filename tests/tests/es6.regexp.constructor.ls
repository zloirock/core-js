QUnit.module \ES6

eq = strictEqual

if (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
  test 'RegExp constructor' !->
    ok typeof! RegExp is \Function, 'RegExp is function'
    eq RegExp.length, 2, 'RegExp.length is 2'
    ok /native code/.test(RegExp), 'looks like native'
    if \name of RegExp => eq RegExp.name, \RegExp, 'RegExp.name is "RegExp" (can fail if compressed)'

    a = /a/g
    ok typeof! RegExp! is \RegExp
    ok typeof! new RegExp! is \RegExp
    b = new RegExp a
    ok a isnt b, 'a isnt b'
    c = RegExp a
    ok a is c, 'a is c'
    eq String(b), '/a/g', 'b is /a/g'

    # allows a regex with flags as the pattern
    eq String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags'
    ok new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof'
    eq new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor'
    /(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)/.exec \abcdefghijklmnopq
    for val, index in \bcdefghij
      eq RegExp"$#{index + 1}", val, "Updates RegExp globals $#{index + 1}"