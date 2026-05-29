import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// InstanceType<typeof Bag> for `class Bag<T> extends Array<T>`. The class's own type
// parameter must not break inheritance resolution: instances still resolve to Array, so
// `.at(0)` and `.findLast(...)` narrow to the Array variants.
class Bag<T> extends Array<T> {}
declare const inst: InstanceType<typeof Bag>;
_atMaybeArray(inst).call(inst, 0);
_findLastMaybeArray(inst).call(inst, x => true);