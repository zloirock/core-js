import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Two destructure-host shapes coexist: proxy-global `globalThis` and a const-bound `{ a: Object }`.
// Each must resolve to its own constructor (Array vs Object) without leaking through the other path.
const from = _Array$from;
const wrapper = {
  a: Object
};
const entries = _Object$entries;
const arr = from('hi');
const pairs = entries({
  k: 1
});
_includesMaybeArray(arr).call(arr, 'h');
_atMaybeArray(pairs).call(pairs, 0);