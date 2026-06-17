import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A conditional-receiver destructure whose key is NOT a genuine candidate on EITHER branch: Set and
// WeakMap carry no pure static `from`. The build tags the meta with an object permissively, but the
// gate (shared with the per-branch-synth viability check) finds no polyfillable branch, so NO "left
// untouched" warning is emitted - it would falsely call `from` a polyfill candidate here. The bare
// branch identifiers are still substituted, so both constructors are polyfilled; only the warning is
// suppressed. Locks the gate against re-emitting the false-positive diagnostic.
const cond = true;
const {
  from
} = cond ? _Set : _WeakMap;
from([1, 2, 3]);