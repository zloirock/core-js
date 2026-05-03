'use strict';
// Mixed prologue plus user requires plus destructure that allocates `var _ref;`.
// `reorderRefsAfterImports` should keep the layout: directives -> imports -> _ref -> body.
// `isImportRegion` accepts `require(...)` ExpressionStatements; verify the var prelude
// lands behind both the synthesized polyfill imports AND the user require lines.
require('side-effect-module');
const { from } = Array;
const arr = from('hi');
const tail = arr.at(-1);
const found = arr.findLast(x => x);
const flat = arr.flat();
console.log(tail, found, flat);
