import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Mixed proxy-global + static-object hosts in a single Program: verify that the two
// destructure-host shapes resolve independently when used side by side.
//   first  - {Array: {from}} = globalThis  - proxy-global descent: keys ['Array'], every
//            intermediate key is a known global; constructor = deepest key 'Array'
//   second - {a: {entries}} = wrapper      - static-object descent: const wrapper holds
//            ObjectExpression; walkStaticReceiverChain dereferences key 'a' -> Object leaf
// Each pair triggers its own STABLE static method (Array.from, Object.entries) so divergent
// emission shows whether either descent path mis-resolves to the other constructor's
// polyfill. Stable choice avoids the esnext-stage gating noise (`Map.of` would be skipped
// regardless of descent correctness because it's not in the `actual/` entry layer)
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