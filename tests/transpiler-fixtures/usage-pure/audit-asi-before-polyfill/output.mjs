import _at from "@core-js/pure/actual/instance/at";
// ASI hazard: previous statement ends without `;`, next statement's polyfill rewrite
// starts with `(`. without a leading `;` the two lines fuse into a call, changing semantics.
// plugin injects `;` ahead of the replacement when statement-leading position + `(`-starting
// content both hold
const x = obj;
x == null ? void 0 : _at(x).call(x, 0);