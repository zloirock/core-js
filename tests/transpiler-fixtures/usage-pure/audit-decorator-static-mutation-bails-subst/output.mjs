import _Object$assign from "@core-js/pure/actual/object/assign";
// a monkey-patch of a static hidden inside a class `@decorator(...)` expression must be detected
// so usage-pure does NOT receiver-less-substitute the static read over the user patch - the static
// stays raw and shares the patched constructor. the scoped mutation pre-pass traverse omitted
// decorator subtrees (the parser drops decorators from the class node's visitor keys), so the patch
// escaped detection on this side. Object.assign on a different static still substitutes normally.
@register(_Object$assign(Array, {
  from: () => []
}))
class C {}
Array.from([1]);