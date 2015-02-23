QUnit.module 'ES6 RegExp'

eq = strictEqual

if /\[native code\]\s*\}\s*$/.test Object.defineProperty
  test 'RegExp allows a regex with flags as the pattern' !->
    a = /a/g
    b = new RegExp a
    ok a isnt b, 'a != b'
    eq String(b), '/a/g', 'b is /a/g'
    eq String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags'
    ok new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof'
    eq new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor'
    /(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)/.exec \abcdefghijklmnopq
    for val, index in \bcdefghij
      eq RegExp"$#{index + 1}", val, "Updates RegExp globals $#{index + 1}"
  
  test 'RegExp#flags' !->
    eq /./g.flags, \g, '/./g.flags is "g"'
    eq /./.flags, '', '/./.flags is ""'
    eq RegExp('.', \gim).flags, \gim, 'RegExp(".", "gim").flags is "gim"'
    eq RegExp('.').flags, '', 'RegExp(".").flags is ""'
    eq /./gim.flags, \gim, '/./gim.flags is "gim"'
    eq /./gmi.flags, \gim, '/./gmi.flags is "gim"'
    eq /./mig.flags, \gim, '/./mig.flags is "gim"'
    eq /./mgi.flags, \gim, '/./mgi.flags is "gim"'