import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// re-aliased const chain in static-wrapper: walkStaticReceiverChain follows
// Foo -> Array (Identifier hop) AND wrapper -> { a: Foo } -> step 'a' -> Foo,
// then Identifier-hop again to 'Array'. The walker chases hops until it lands on
// either an unbound Identifier or an ObjectExpression. distinct prototype methods
// per receiver narrow array typing post-from
const Foo = Array;
const wrapper = {
  a: Foo
};
const from = _Array$from;
const arr = from(['x']);
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'x');