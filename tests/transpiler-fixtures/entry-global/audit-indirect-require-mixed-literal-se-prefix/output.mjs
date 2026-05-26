import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// mixed prefix: literal `0` (side-effect-free, drops) interleaved with `spy()` (observable,
// preserved). `mayHaveSideEffects` filters per-slot so the pure literals fall out while the
// observable call survives. preserves ordering relative to other surviving prefix slots
function spy() {
  return 1;
}
spy();