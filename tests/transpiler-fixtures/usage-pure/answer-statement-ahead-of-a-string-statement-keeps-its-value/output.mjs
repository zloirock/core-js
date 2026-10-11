// an answer statement whose removal would leave the string statement after it first in its body - a directive
// prologue - keeps its value instead, so that string stays an expression: at the top of the file and in a function
// body alike, parenthesized or not
false;
'use client';
export function strictFromHere() {
  false;
  'use strict';
  return this;
}
export function strictFromHereParenthesized() {
  false;
  'use strict';
  return this;
}