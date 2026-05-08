import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// `({ Array: { from } = {} } = globalThis)` is a wrapped destructure-assignment, not a declarator.
// Cascade flatten must track the outermost wrapper as LHS so the polyfill alias survives the wrapper layer.
let from;
let of;
from = _Array$from;
of = _Array$of;
from('hi');
of(1, 2);