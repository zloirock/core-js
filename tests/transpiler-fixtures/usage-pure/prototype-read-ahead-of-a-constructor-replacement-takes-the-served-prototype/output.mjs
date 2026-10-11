import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a whole-constructor replacement owns the `Ctor.prototype` reads after it, but a prototype read that runs
// ahead of every write of the constructor's slot reads the prototype this build serves, as a static read
// does - bare or off the realm
export const arrayAt = _atMaybeArray(Array.prototype);
export const stringAt = _atMaybeString(_globalThis.String.prototype);
_globalThis.Array = SubArray;
_globalThis.String = SubString;