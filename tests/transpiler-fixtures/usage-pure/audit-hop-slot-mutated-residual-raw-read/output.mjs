import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// a SLOT-mutated ctor pair (the global's own key is reassigned) keeps the hop residual
// on the RAW member read - the user-installed replacement wins on EVERY surface after it: bare
// reads stay verbatim on the deopted name, so the key patch lands on the shim
// and the raw destructure read sees the same object. a capture ahead of the replacement
// still reads the pristine slot, so it takes the pure import
const orig = _Map;
_globalThis.Map = function FakeMap() {};
Map.groupBy = function patched() {};
const {
  groupBy: rawRead
} = _globalThis.Map;
console.log(orig, rawRead);