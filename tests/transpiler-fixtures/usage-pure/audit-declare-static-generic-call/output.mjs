import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Static method on `declare class` with explicit method-level type-arg.
// the class-member resolution TSDeclareMethod branch threads only classSubst, not call-site
// method-level type args - Box.make<string>() return type stays raw T[] (generic Array).
declare class Box {
  static make<T>(): T[];
}
const r = Box.make<string>();
_atMaybeArray(r).call(r, 0);