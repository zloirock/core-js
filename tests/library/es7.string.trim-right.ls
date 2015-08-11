'use strict';

QUnit.module \ES7

eq = strictEqual

test 'String#trimRight' !->
  {trimRight} = core.String
  ok typeof! trimRight is \Function, 'Is function'
  eq trimRight(' \n  q w e \n  '), ' \n  q w e', 'removes whitespaces at right side of string'
  eq trimRight('\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'), '', 'removes all whitespaces'
  eq trimRight('\u200b\u0085'), '\u200b\u0085', "shouldn't remove this symbols"

  if !(-> @)!
    throws (-> trimRight null, 0), TypeError
    throws (-> trimRight void, 0), TypeError