import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a SLOT-mutated ctor pair (the global's own key is reassigned) keeps the hop residual
// on the RAW member read - the user-installed replacement wins on EVERY surface: bare
// reads stay verbatim on the deopted name, so the key patch lands on the shim
// and the raw destructure read sees the same object
const orig = _globalThis.Map;
_globalThis.Map = function FakeMap() {};
Map.groupBy = function patched() {};
const {
  groupBy: rawRead
} = _globalThis.Map;
console.log(orig, rawRead);