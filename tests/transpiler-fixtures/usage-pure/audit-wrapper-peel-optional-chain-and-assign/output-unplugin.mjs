import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// The runtime-object peel that precedes a global lookup must snip the same wrapper set at every site.
// An optional-chain-wrapped constructor and an assignment-expression runtime object both resolve to
// the real constructor, so an instance method on the result narrows to its array-specific helper
// (a paren-only / chain-blind peel left the result unresolved and emitted the generic dispatcher).
_atMaybeArray(_ref = new (_globalThis.Array)()).call(_ref, 0);
let a;
_flatMaybeArray(_ref2 = (a = Array, _Array$from)([1])).call(_ref2);