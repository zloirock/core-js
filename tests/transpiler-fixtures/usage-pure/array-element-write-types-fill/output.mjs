import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
// an alias hands the same array to another binding - a mutator through the alias is
// invisible to this walk, so the aliasing itself bails
const origin = [[1], [2]];
const alias = origin;
_fillMaybeArray(alias).call(alias, "x");