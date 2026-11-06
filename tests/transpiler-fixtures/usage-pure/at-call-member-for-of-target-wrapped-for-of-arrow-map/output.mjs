import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// control: a DIFFERENT receiver's same-named method is not part of the write set
const e = [8, 9];
const f = [10];
for (e.map of fns) {
  _mapMaybeArray(f).call(f, x => x);
}