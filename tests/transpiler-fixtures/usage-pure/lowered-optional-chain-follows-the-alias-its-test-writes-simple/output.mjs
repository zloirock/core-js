import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
// `?.`-lowered input (a transpiler ran before this plugin): the optional chain arrives as a ternary whose
// TEST assigns a synthetic alias, and the read past the guard follows that write - plain, chained, in the
// strict spelling, window-valued, beside an effect or as a `??=` over a binding still unset, in any host -
// so claims and typed dispatch light up exactly like the unlowered spelling
var _g;
export const simple = (_g = _globalThis) == null ? void 0 : _nameMaybeFunction(_Set);