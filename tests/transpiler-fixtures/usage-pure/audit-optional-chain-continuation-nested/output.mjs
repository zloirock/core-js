import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// nested optional chain with two polyfilled instance methods: `obj?.at(0)?.includes(42)`.
// plugin must polyfill `.at` and `.includes` simultaneously and emit a single combined
// expression preserving the optional-chain short-circuit semantics
const r = null == (_ref = obj == null ? void 0 : _at(obj).call(obj, 0)) ? void 0 : _includes(_ref).call(_ref, 42);