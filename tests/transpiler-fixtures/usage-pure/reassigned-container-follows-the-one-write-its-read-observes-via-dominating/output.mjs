import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// pure resolves a REASSIGNED container binding on proof: an unconditional write, nothing written after the
// read, is the ONE value the read can observe, so pure follows it - through a pattern, a member read, an
// array wrapper, a class base, a reassigned class, a write behind an effect, a cross-form pattern write or a
// `??=` over a binding still unset - and serves that value's static, never the init's
let rw1 = {
  k: Object
};
rw1 = {
  k: _Map
};
const {
  k: {
    groupBy: viaDominating
  }
} = {
  k: {
    groupBy: _Map$groupBy
  }
};
export { viaDominating };