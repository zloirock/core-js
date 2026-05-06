import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// InstanceType<typeof Cls> for a class extending Array via super-type-args.
// resolveNamedType's InstanceType branch resolves arg via resolveTypeQueryBinding
// (typeof Cls -> binding path), then resolveClassInheritance walks superClass.
// Probe whether the class's own type-param does not break inheritance walk -
// generic class without explicit super-type-arg should still narrow to Array.
class Bag<T> extends Array<T> {}
declare const inst: InstanceType<typeof Bag>;
_atMaybeArray(inst).call(inst, 0);
_findLastMaybeArray(inst).call(inst, x => true);