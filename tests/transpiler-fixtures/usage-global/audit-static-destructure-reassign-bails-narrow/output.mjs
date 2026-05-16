import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// `staticPairFromDestructure` walks the pattern of an unrewritten `let { from } = Array`
// to derive `(Array, from)` for return-type narrowing. when `from` is reassigned anywhere
// (here inside a sibling function), the binding still has the original pattern attached,
// but the runtime value at the call site may not be `Array.from` anymore. without the
// `constantViolations` guard, `from(...)` infers `Array` as the return shape and emits only
// `es.array.at`; with the guard, the resolver bails and conservatively emits both
// `es.array.at` and `es.string.at` to cover all possible runtime types of the result.
let {
  from
} = Array;
function reassign() {
  from = x => x[0];
}
const arr = from([1, 2]);
arr.at(0);