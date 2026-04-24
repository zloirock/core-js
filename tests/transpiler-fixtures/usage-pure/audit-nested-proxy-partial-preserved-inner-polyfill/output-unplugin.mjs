import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// partial nested flatten: `from` is a plain binding, `of = Array.of` has an inner expression
// that is itself polyfillable. previously `walkAstNodes` marked every descendant as skipped,
// so the preserved `{ of = Array.of }` kept `Array.of` unpolyfilled - buggy native would be
// used at runtime. flatten the AssignmentPattern leg too: both become standalone bindings
const from = _Array$from;
const of = _Array$of;
from([1, 2]);
of(3);