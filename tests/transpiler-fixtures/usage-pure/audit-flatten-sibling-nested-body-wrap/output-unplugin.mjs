import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Single declaration with two declarators: outer flattens `{Array:{from}} = globalThis`,
// sibling is an arrow with nested arrow bodies, each calling `.at(0)` on its own array
// literal. Each arrow body gets its own `var _ref` wrap and both `.at` polyfills emit.
const from = _Array$from;
const sibling = () => { var _ref; return _atMaybeArray(_ref = [1]).call(_ref, 0) + ((() => { var _ref2; return _atMaybeArray(_ref2 = [2]).call(_ref2, 0); })()); };
console.log(from, sibling());