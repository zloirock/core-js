import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// Nested prototype reads use the receiver family's pure instance entry.
// That entry pins core-js's implementation; a later prototype patch does not replace it.
// Bare, aliased and call-returned realm roots must make the same dispatch decision.
Array.prototype.at = function () {
  return 'user';
};
const realm = () => _globalThis;
const g = realm();
const bare = _atMaybeArray(_globalThis.Array.prototype);
const held = _atMaybeArray(_globalThis.Array.prototype);
const called = _atMaybeArray(_globalThis.Array.prototype);
export { bare, held, called };