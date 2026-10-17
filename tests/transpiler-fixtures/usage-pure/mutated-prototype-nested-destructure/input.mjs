// Nested prototype reads use the receiver family's pure instance entry.
// That entry pins core-js's implementation; a later prototype patch does not replace it.
// Bare, aliased and call-returned realm roots must make the same dispatch decision.
Array.prototype.at = function () { return 'user'; };
const realm = () => globalThis;
const g = realm();
const { Array: { prototype: { at: bare } } } = globalThis;
const { Array: { prototype: { at: held } } } = g;
const { Array: { prototype: { at: called } } } = realm();
export { bare, held, called };
