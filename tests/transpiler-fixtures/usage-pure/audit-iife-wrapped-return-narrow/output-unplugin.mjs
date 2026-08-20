import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$assign from "@core-js/pure/actual/object/assign";
// IIFE-identity receiver resolution must peel runtime-transparent wrappers off the body's
// returned node before the identity-lift: oxc preserves the `(a)` paren / SE tail that babel
// strips at parse, in both expression-body and block-body returns. without the peel the
// destructured static loses its narrow -> no polyfill (unplugin). distinct ie11-absent statics
(a => (a))(Array);
const from = _Array$from;
(a => (0, a))(Array);
const of = _Array$of;
(a => { return (a); })(Object);
const assign = _Object$assign;
from([1]);
of(2);
assign({}, {});