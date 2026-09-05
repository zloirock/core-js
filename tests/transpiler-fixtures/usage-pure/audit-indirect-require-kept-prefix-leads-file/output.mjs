import "core-js/modules/es.array.includes";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// an indirect-require entry at the head of the file keeps its prefix, and that prefix needs a memo
// ref: the `var _ref;` block anchors after the trailing user import OF THE BODY AS REWRITTEN - the
// kept prefix is a plain statement now, not an import-like one the refs should land behind, so the
// declaration prints above its first write like the AST emitter's
_atMaybeArray(_ref = [1]).call(_ref, 0);
export const r = 1;