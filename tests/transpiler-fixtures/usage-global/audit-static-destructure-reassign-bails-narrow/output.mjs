import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// an unrewritten `let { from } = Array` derives `(Array, from)` for return-type narrowing.
// when `from` is reassigned anywhere (here a sibling function), the binding keeps the
// original pattern but the runtime value at the call may no longer be `Array.from`. a
// reassignment must make the resolver bail and conservatively emit both `es.array.at` and
// `es.string.at`, not narrow to `Array` and emit only `es.array.at`.
let {
  from
} = Array;
function reassign() {
  from = x => x[0];
}
const arr = from([1, 2]);
arr.at(0);