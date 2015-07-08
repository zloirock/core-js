QUnit.module \ES6

eq = strictEqual

if (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
  test 'RegExp#flags' !->
    eq /./g.flags, \g, '/./g.flags is "g"'
    eq /./.flags, '', '/./.flags is ""'
    eq RegExp('.', \gim).flags, \gim, 'RegExp(".", "gim").flags is "gim"'
    eq RegExp('.').flags, '', 'RegExp(".").flags is ""'
    eq /./gim.flags, \gim, '/./gim.flags is "gim"'
    eq /./gmi.flags, \gim, '/./gmi.flags is "gim"'
    eq /./mig.flags, \gim, '/./mig.flags is "gim"'
    eq /./mgi.flags, \gim, '/./mgi.flags is "gim"'