// a whole-constructor replacement owns the `Ctor.prototype` reads after it, but a prototype read that runs
// ahead of every write of the constructor's slot reads the prototype this build serves, as a static read
// does - bare or off the realm
export const arrayAt = Array.prototype.at;
export const stringAt = globalThis.String.prototype.at;
globalThis.Array = SubArray;
globalThis.String = SubString;
