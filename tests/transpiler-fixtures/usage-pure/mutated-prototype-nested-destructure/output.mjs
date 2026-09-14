import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A mutated PROTOTYPE method consumed through a NESTED destructure off the global object - spelled
// bare, held by an alias, or returned by a call the inline canon proves. The receiver's type names the
// constructor on both legs (the shared surface resolver reads a root the value canon proves to be the
// global object), so both dispatch the Array variant, whose helper serves the method the prototype
// holds at the call - the user's patch survives. The alias-of-call root once took the generic
// dispatcher on the unplugin leg alone.
Array.prototype.at = function () {
  return 'user';
};
const realm = () => _globalThis;
const g = realm();
const bare = _atMaybeArray(_globalThis.Array.prototype);
const held = _atMaybeArray(_globalThis.Array.prototype);
const called = _atMaybeArray(_globalThis.Array.prototype);
export { bare, held, called };