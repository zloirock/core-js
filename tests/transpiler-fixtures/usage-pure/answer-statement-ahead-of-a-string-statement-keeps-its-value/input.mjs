// an answer statement whose removal would leave the string statement after it first in its body - a directive
// prologue - keeps its value instead, so that string stays an expression: at the top of the file and in a function
// body alike, parenthesized or not
typeof Symbol == 'undefined' && installSymbol();
'use client';
export function strictFromHere() {
  typeof Map == 'undefined' && installMap();
  'use strict';
  return this;
}
export function strictFromHereParenthesized() {
  (typeof Set == 'undefined' && installSet());
  'use strict';
  return this;
}
