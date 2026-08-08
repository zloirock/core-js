import _Array$from from "@core-js/pure/actual/array/from";
// for-loop init with a destructure whose receiver has side effects: the receiver must
// be evaluated once and shared across destructure rewrites.
let sideFx = () => 0;
for (const _ref = (sideFx(), Array), from = _Array$from; sideFx() < 1;) {
  from([0]);
  break;
}