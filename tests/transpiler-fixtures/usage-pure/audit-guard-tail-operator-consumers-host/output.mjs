import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an `extends` clause parenthesizes the fold too - it takes a LeftHandSideExpression - so the
// tail rides inside those parens exactly as under an operator. listing that consumer on one
// emitter only spelled the same fold two ways
const host = null == _globalThis.window ? void 0 : _self;
export { host };