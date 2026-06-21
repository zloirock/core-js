import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// mixed prefix: literal `0` (side-effect-free, drops) interleaved with `spy()` (observable,
// preserved). per-slot filtering drops the pure literals while the observable call survives,
// preserving ordering relative to other surviving prefix slots
function spy() {
  return 1;
}
spy();