import _globalThis from "@core-js/pure/actual/global-this";
// computed string-key LHS of a logical-assign on the proxy-global: the receiver substitutes
// (`_globalThis['Map'] ||= {}`), the write records the slot mutation and DEOPTS the name for
// any later read in the file. the statement itself is already a member write on the live
// global object. bracket keys resolve like the dotted form
_globalThis['Map'] ||= {};
_globalThis[`WeakMap`] ||= {};