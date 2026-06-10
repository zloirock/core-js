import _Array$from from "@core-js/pure/actual/array/from";
// `function f({Array: {from}} = globalThis)` - nested-proxy default at function param position.
// the DEFAULT itself is replaced with a synthesized literal: it fires ONLY when no argument is
// passed (polyfill-wins there), while ANY caller-supplied object destructures natively - a
// caller's custom `from` wins, and an absent / undefined leaf stays undefined exactly as
// native (a leaf inline default would silently polyfill it)
export function f({
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
}) {
  return from([1, 2, 3]);
}