// a monkey-patched static no longer returns what its declaration says, so its RESULT type is unknown
// - in the global flavor too, where nothing is substituted but a narrow taken off the declaration
// still drops the polyfill the replacement actually needs. both the constructed-object channel and
// the static-call return channel read the same census. the control row narrows through a channel no
// patch touches, so it proves the bail is the PATCH talking and not a blanket widening. distinct
// method per line so each row is attributable
Object.create = myCreate;
let patchedCreate = Object.create(Array.prototype);
export const a = patchedCreate.at(0);
Array.from = myFrom;
export const b = Array.from([1]).includes(2);
let literalProto = { __proto__: Array.prototype };
export const c = literalProto.flatMap(f);
