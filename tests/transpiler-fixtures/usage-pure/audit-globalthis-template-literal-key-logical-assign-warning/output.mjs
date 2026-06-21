import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// single-quasi TemplateLiteral computed key on proxy-global LHS - the cooked-string form
// resolves to the global name, so the gate fires and the warning uses bracket notation
_globalThis[`Promise`] ||= {};