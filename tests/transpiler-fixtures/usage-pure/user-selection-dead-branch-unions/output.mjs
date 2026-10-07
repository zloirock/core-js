import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise from "@core-js/pure/actual/promise";
// The branches a walk enumerates off a user selection are the ones the build runs: the arm a presence
// test never takes is no union member, so pure mirrors none of it - a destructure, a default, an
// assignment and the realm-detection idiom alike. A test that lets its right run keeps it live.
export const {
  from
} = {
  from: _Array$from
};
export const {
  of: viaFalse
} = {
  of: _Array$of
};
export function viaDefault({
  fromAsync: f
} = {
  fromAsync: _Array$fromAsync
}) {
  return f;
}
let assigned;
({
  hasOwn: assigned
} = {
  hasOwn: _Object$hasOwn
});
export const realm = _Promise;
export const {
  groupBy: live
} = {
  groupBy: _Map$groupBy
};
export { assigned };