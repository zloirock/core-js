import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A call before initialization cannot patch the constructor it would later return.
try {
  pick().from = patched;
} catch {}
var pick = function () {
  return Array;
};
Array.from([1]);

// An alias captures its value at declaration, even when a later function calls it.
var alias = group;
var group = function () {
  return Object;
};
function run() {
  alias().groupBy = patched;
}
try {
  run();
} catch {}
Object.groupBy([1], String);