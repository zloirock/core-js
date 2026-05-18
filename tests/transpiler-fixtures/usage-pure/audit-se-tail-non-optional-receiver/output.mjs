import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// SE-tail receiver with NON-optional call: `(0, globalThis).flat(0)` - no `?.` on the
// call. the SE-tail substitution path is independent of call-optionality (it lives in
// `resolveReceiverSource`); asserts the substitution fires for the eager-call form too
_flatMaybeArray(_ref = (0, _globalThis)).call(_ref, 0);