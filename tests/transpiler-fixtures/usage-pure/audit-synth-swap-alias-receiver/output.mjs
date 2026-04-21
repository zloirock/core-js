import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
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