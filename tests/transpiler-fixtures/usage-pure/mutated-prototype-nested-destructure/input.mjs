// A mutated PROTOTYPE method consumed through a NESTED destructure off the global object - spelled
// bare, held by an alias, or returned by a call the inline canon proves. The receiver's type names the
// constructor on both legs (the shared surface resolver reads a root the value canon proves to be the
// global object), so both dispatch the Array variant, whose helper serves the method the prototype
// holds at the call - the user's patch survives. The alias-of-call root once took the generic
// dispatcher on the unplugin leg alone.
Array.prototype.at = function () { return 'user'; };
const realm = () => globalThis;
const g = realm();
const { Array: { prototype: { at: bare } } } = globalThis;
const { Array: { prototype: { at: held } } } = g;
const { Array: { prototype: { at: called } } } = realm();
export { bare, held, called };
