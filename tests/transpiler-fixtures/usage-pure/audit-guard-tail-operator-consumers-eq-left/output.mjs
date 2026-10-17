import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// the guard on the LEFT of an operator is an operand too: the folded tail may not end the
// expression there either
export const eqLeft = (null == _globalThis.window ? void 0 : _Promise$resolve(1).constructor.length) === 1;