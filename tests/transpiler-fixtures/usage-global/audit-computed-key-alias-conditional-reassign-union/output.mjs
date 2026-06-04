import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// computed-key alias K is conditionally reassigned BEFORE the use, so at the call K may be either
// 'from' (fall-through) or 'of' (branch taken). usage-global over-injects for every reachable key,
// so both es.array.from and es.array.of are emitted.
let K = 'from';
if (window.flag) {
  K = 'of';
}
Array[K]([1, 2, 3]);