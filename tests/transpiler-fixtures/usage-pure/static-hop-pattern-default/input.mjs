// A static-valued pattern reads the ponyfill, which is always defined.
// Its default stays dead; an instance-valued pattern keeps its runtime default guard.
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
