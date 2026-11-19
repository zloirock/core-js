import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// a `let` CONDITIONALLY reassigned in its declaring scope but READ inside a nested closure:
// skipped branch keeps init 'of', taken branch sees 'from', so `Array[K]` may dispatch
// Array.of OR Array.from and usage-global injects both. estree-toolkit omits the
// cross-boundary reassignment from the binding's constantViolations (babel records it), so
// both pipelines must agree on the union. (unconditional dead-init case has its own fixture.)
let K = 'of';
if (Date.now() % 2) K = 'from';
const read = () => Array[K]([1, 2, 3]);
read();