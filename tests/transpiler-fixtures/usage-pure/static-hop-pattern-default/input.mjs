// a STATIC claim whose value is a pattern with a default binds the pattern off the guarded import
// binding: the static guard tests the always-defined ponyfill in place, on every host and behind a
// proxy hop alike, while a typed instance twin keeps the memoized instance guard. a pattern without a
// default reads the raw slot on both legs - a function destructured as an iterable throws either way
const { of: [viaCtor = ")"] = [] } = Array;
const { Array: { of: [viaHop] = [] } } = globalThis;
const { Array: { of: [viaOuterDefault = ")"] = [] } = {} } = globalThis;
let viaAssign;
({ Array: { of: [viaAssign = ")"] = [] } = {} } = globalThis);
const { of: { foo: viaObjectLeft } = {} } = Array;
const src = [1, [2]];
const { at: [viaInstance = 0] = [] } = src;
const { Array: { of: [rawSlot] } } = globalThis;
export { viaCtor, viaHop, viaOuterDefault, viaAssign, viaObjectLeft, viaInstance, rawSlot };
