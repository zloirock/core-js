import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a nested instance method in a FOR-INIT header. the loop header can't host a preceding `const _ref`, so
// NO memoization fires: the polyfill binds as a declarator of the header (`flat = _flatMaybeArray([..])`) with
// the constant receiver re-emitted in place. the residual the extraction leaves binds only its sentinel and
// reads nothing the extraction did not, so it is eliminated. locks the negative memo gate on both emitters
for (const flat = _flatMaybeArray([1, [2]]); false;) flat();