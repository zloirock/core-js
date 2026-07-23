import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a non-cyclic type alias referenced 3+ times on one resolution walk must resolve to its concrete
// type every time. the resolver marks a decl open (grey) while resolving and clears it on the way
// out; a memo-hit early-return that skipped the clear leaked the decl into grey, so the 3rd+ shared
// reference read it as a cycle and the receiver degraded to a generic dispatch. each typed receiver
// below is a union of 3-4 references to the SAME array alias and must keep the Array-typed dispatch.
// distinct method per line.
type Elems = number[];
type Quad = Elems | Elems | Elems | Elems;
type Trio = Elems | Elems | Elems;
export function pick(xs: Quad) {
  return _atMaybeArray(xs).call(xs, 0);
}
export function has(xs: Trio) {
  return _includesMaybeArray(xs).call(xs, 1);
}