import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A side-effect-prefixed proxy-global WHOLE-CONSTRUCTOR receiver in a top-level const destructure
// must swap to the pure constructor AND preserve the SE prefix, not keep the native `_globalThis.Map`
// (which on ie:11 / non-browser hosts may lack the constructor or its statics). The retained `...rest`
// keeps the receiver live; without the fix the SE prefix bailed the leaf lookup to a root-only swap.
function effect() {
  return 0;
}
const groupBy = _Map$groupBy;
const {
  groupBy: _unused,
  ...mapRest
} = (effect(), _Map);
groupBy([], item => item);