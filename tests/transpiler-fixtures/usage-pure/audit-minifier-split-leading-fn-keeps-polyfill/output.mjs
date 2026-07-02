import _Array$from from "@core-js/pure/actual/array/from";
// minifier-collapsed sequence whose split is REQUIRED to reach the proxy-global destructure
// (`({from}=Array)`). the split emits each element as a statement; a leading FunctionExpression
// emitted bare (`function(){};`) reparses as a nameless function declaration -> the whole split is
// silently discarded and the polyfill DROPPED. parenthesizing the hazard keeps the split valid so
// `from` is rewritten to the array.from polyfill.
let from;
(function () {});
from = _Array$from;
from([1], x => x);