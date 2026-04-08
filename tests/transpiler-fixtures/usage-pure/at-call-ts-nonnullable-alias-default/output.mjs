import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Nullable<T = number[]> = T | null;
function run(x: NonNullable<Nullable>) {
  _atMaybeArray(x).call(x, 0);
}