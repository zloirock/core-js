// a const-alias chain resolves each hop in ITS OWN declaration scope, not the receiver-use
// scope - an inner binding shadowing an intermediate hop (or the winning IIFE call-arg) name
// must not swallow the receiver. distinct static per row keeps each injection attributable

// single-static chain (`root -> link -> Array`): an inner param shadows the middle hop, but
// the alias resolves against the module scope where the hop is a const
const arrayRoot = Array;
const arrayLink = arrayRoot;
export function viaStaticChain(arrayRoot) {
  const { of } = arrayLink;
  return of(1, 2);
}
