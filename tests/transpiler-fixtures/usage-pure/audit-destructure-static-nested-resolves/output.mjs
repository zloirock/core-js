import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Const-bound `wrapper = { a: Array }` exposes a static-object descent path through `{ a: { from } }`.
// Constructor leaf must resolve to Array so both polyfill emit and downstream instance narrowing fire.
const wrapper = {
  a: Array
};
const from = _Array$from;
const arr = from('hi');
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'h');