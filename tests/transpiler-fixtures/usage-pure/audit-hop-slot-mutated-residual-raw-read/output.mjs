import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a SLOT-mutated ctor pair (the global's own key is reassigned) keeps the hop residual
// on the RAW member read - the user-installed replacement must win there; the key patch
// routed to the ponyfill stays invisible through it. extractions stay leaf-gated
const orig = _globalThis.Map;
_globalThis.Map = function FakeMap() {};
_Map.groupBy = function patched() {};
const {
  groupBy: rawRead
} = _globalThis.Map;
console.log(orig, rawRead);