// Each alias hop resolves where its initializer evaluates; later shadows cannot retype it.
// The sole IIFE call supplies the value used by both the synthesized argument and default.
// A var name hoists, but its initializer still reads bindings in the block where it is written.
// Different static methods keep every scope boundary observable.

// single-static chain (`root -> link -> Array`): an inner param shadows the middle hop, but
// the alias resolves against the module scope where the hop is a const
const arrayRoot = Array;
const arrayLink = arrayRoot;
export function viaStaticChain(arrayRoot) {
  const { of } = arrayLink;
  return of(1, 2);
}
