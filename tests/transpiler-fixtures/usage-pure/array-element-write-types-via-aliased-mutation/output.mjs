import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// an alias hands the same array to another binding - a mutator through the alias is
// invisible to this walk, so the aliasing itself bails
const origin = [[1], [2]];
const alias = origin;
_fillMaybeArray(alias).call(alias, "x");
export const viaAliasedMutation = _includes(_ref = origin[0]).call(_ref, 9);