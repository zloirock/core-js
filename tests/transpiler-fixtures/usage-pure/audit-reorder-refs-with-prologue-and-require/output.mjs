'use strict';

// Mixed prologue plus user requires plus destructure that allocates `var _ref;`.
// `reorderRefsAfterImports` should keep the layout: directives -> imports -> _ref -> body.
// `isImportRegion` accepts `require(...)` ExpressionStatements; verify the var prelude
// lands behind both the synthesized polyfill imports AND the user require lines.
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
require('side-effect-module');
const from = _Array$from;
const arr = from('hi');
const tail = _atMaybeArray(arr).call(arr, -1);
const found = _findLastMaybeArray(arr).call(arr, x => x);
const flat = _flatMaybeArray(arr).call(arr);
console.log(tail, found, flat);