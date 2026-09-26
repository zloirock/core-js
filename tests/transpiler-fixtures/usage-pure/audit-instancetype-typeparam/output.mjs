import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `ReturnType<typeof fn<Args>>` instantiation: type-args sit on the inner TSTypeQuery
// (`typeof probe<typeof Box>`), not on the outer ReturnType. fold them into the return
// annotation before recursing so `InstanceType<T>` sees `typeof Box` instead of raw T
class Box {
  data: number[] = null!;
}
declare function probe<T extends typeof Box>(c: T): InstanceType<T>;
declare const i: ReturnType<typeof probe<typeof Box>>;
_atMaybeArray(_ref = i.data).call(_ref, 0);