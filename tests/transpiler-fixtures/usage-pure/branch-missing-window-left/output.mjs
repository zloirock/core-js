import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref;
// An absent bare window keeps its ReferenceError before the member read.
// A present operand selects the realm and still needs the Promise polyfill.
export const size = (_ref = window && _globalThis, _ref === _globalThis ? _Promise : _ref.Promise).length;