import _globalThis from "@core-js/pure/actual/global-this";
// `globalThis.Map ||= X` - proxy-global member LHS of a logical-assign: the receiver
// substitutes and the slot records (the name deopts for any later read). the statement
// itself is already a member write on the live global object - the guard-shim installs
// where the slot is absent and the file's raw reads then serve it
_globalThis.Map ||= {};