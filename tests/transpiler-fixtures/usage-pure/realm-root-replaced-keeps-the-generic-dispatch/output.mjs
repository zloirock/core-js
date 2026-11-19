import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _self from "@core-js/pure/actual/self";
// a prototype read off a realm root is typed only while that root's own slot stands: after the file replaces the
// name (`window.self = other`) the root is the user's object and the dispatch is the generic one, while a read
// ahead of the replacement types like its twin - the root and each realm hop of its path asked where they are read
const at = _atMaybeArray(_self.Array.prototype);
export const destructured = at;
export const ahead = _includesMaybeArray(_self.Array.prototype);
export const hopAhead = _flatMaybeArray(_self.Array.prototype);
window.self = other;
export const after = _at(self.Array.prototype);
export const hopAfter = _includes(_globalThis.self.Array.prototype);