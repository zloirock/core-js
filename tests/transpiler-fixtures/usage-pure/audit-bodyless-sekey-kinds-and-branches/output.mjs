import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// additional bodyless-host coverage for the SE-key destructure `var` join: distinct polyfill KINDS and emit
// branches that the if/for-of/do-while base cases do not exercise

// global-ctor kind (vs static / instance): the extracted constructor binding registers a global alias and,
// in a bodyless if, joins the one `var` with the residual
if (c) var P = _Promise,
  {
    [(log(), 'Promise')]: _unused
  } = _globalThis;

// siblingDeclarator branch: a multi-declarator instance method appends a TRAILING declarator (no preceding
// statement), so the bodyless body stays a single statement
while (c) var first = init,
  {
    [(log(), 'flatMap')]: _unused2
  } = rows,
  fm = _flatMapMaybeArray(rows);

// multi-element: two SE-key extracts precede one residual in a single `var` (distinct methods per leaf)
do var {
    [(log(), 'findLast')]: _unused3
  } = rows,
  fl = _findLastMaybeArray(rows),
  {
    [(log(), 'findLastIndex')]: _unused4
  } = rows,
  fli = _findLastIndexMaybeArray(rows); while (c);