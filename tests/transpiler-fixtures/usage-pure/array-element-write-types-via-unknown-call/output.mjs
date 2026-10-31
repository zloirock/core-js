import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// a method the registry does not know may be any mutator at runtime, so it bails too
const custom = [[1], [2]];
custom.custom();
export const viaUnknownCall = _includes(_ref = custom[0]).call(_ref, 3);