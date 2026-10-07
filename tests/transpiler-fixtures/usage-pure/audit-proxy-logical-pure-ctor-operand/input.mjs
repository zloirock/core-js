// A pure-constructor proxy-global operand in a LOGICAL-expression destructure receiver must whole-swap
// to the pure constructor, like a bare receiver: `globalThis.self.Map` -> `_Map`, not the native
// root-swapped `_globalThis.Map`. Per-operand parity with the main receiver (and babel's synth-swap): the
// selection folds to the operand it decides, and the operand right of an undecided left swaps in place.
const { groupBy, ...rest } = globalThis.self.Map || Set;
groupBy([], item => item);
const { groupBy: viaRight, ...others } = maybe || globalThis.self.Map;
viaRight([], item => item);
