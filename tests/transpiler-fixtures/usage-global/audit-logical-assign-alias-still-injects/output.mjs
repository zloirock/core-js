import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// a global alias reassigned by a LOGICAL assignment (||= / &&= / ??=) is overwritten only on the
// short-circuit path, so the alias still holds the global on the other path - usage-global must keep
// injecting the init global's static (over-inject-safe), not treat the conditional write as dominating.
// distinct base-global STATIC methods per line (each injects nothing from the bare init read, so the
// polyfill is attributable solely to the alias usage surviving the conditional reassign).
var A = Array;
A ||= 0;
A.from([1]);
var B = Array;
B &&= 0;
B.of(1);
var O = Object;
O ??= 0;
O.fromEntries([['k', 1]]);