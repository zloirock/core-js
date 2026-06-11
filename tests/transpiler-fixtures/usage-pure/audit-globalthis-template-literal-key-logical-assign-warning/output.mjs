import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// single-quasi TemplateLiteral computed key on proxy-global LHS - `memberKeyName`
// recognises the cooked-string form, gate fires with bracket notation
_globalThis[`Promise`] ||= {};