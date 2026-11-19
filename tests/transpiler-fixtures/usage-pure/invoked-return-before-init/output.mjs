import _Array$from from "@core-js/pure/actual/array/from";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A call before initialization cannot patch the constructor it would later return.
try {
  pick().from = patched;
} catch {}
var pick = function () {
  return Array;
};
_Array$from([1]);

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
_Object$groupBy([1], String);