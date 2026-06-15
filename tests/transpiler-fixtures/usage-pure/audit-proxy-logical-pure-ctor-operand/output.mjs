import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
const groupBy = _Map$groupBy;
// A pure-constructor proxy-global operand in a LOGICAL-expression destructure receiver must whole-swap
// to the pure constructor, like a bare receiver: `globalThis.self.Map` -> `_Map`, not the native
// root-swapped `_globalThis.Map`. Per-operand parity with the main receiver (and babel's synth-swap).
const {
  groupBy: _unused,
  ...rest
} = _Map || _Set;
groupBy([], item => item);