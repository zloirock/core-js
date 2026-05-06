import _globalThis from "@core-js/pure/actual/global-this";
import _Array$from from "@core-js/pure/actual/array/from";
// synthetic argument-receiver substitution where the receiver is an alias: the rewrite
// must preserve the alias binding, not inline the receiver expression twice.
const R = Array;
function g({
  from,
  custom
} = {
  from: _Array$from,
  custom: R.custom
}) {
  return [from([1]), custom];
}
_globalThis.__call = () => g({
  from: () => [],
  custom: 'ok'
});