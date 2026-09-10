// the flatten's sibling walk climbs from a matched receiver identifier up its member chain to decide
// whether another channel owns it. a cast or a paren sitting BETWEEN the two is transparent to that
// question - the chain is still the one rooted at this receiver. this flavor prints the source back
// verbatim, wrappers and all, so what it locks here is the family each row pulls; the walk's own
// verdict on the receiver is visible on the pure twin
const { Array: { of } } = globalThis, cast = (globalThis as any)['Promise'];
const { Array: { from } } = globalThis, nonNull = (globalThis!)['Set'];
const { Object: { entries } } = globalThis, paren = ((globalThis) as any).Promise;
const { Object: { assign } } = globalThis, satisfied = (globalThis satisfies object)['Map'];
const { Number: { isInteger } } = globalThis, nested = () => {
  const NAME = 'Promise';
  return (globalThis as any)[NAME];
};

// a claim does not have to be ROOTED at the receiver to erase it: one that merely CONTAINS it takes
// it along, so the walk stands down there too. the argument of a call whose result is claimed, in
// both key spellings and through a static off a constructor
function identity(value) {
  return value;
}
const { Array: { isArray } } = globalThis, callArg = identity(globalThis).Promise;
const { Number: { isSafeInteger } } = globalThis, callArgComputed = identity(globalThis)['Set'];
const { Object: { freeze } } = globalThis, callArgStatic = identity(globalThis).Object.fromEntries([]);

// negatives: no wrapper at all, and a containing member whose key claims nothing
const { Number: { isFinite } } = globalThis, plain = globalThis['Promise'];
const { Object: { keys } } = globalThis, unclaimed = identity(globalThis).noSuchThing;

export { of, cast, from, nonNull, entries, paren, assign, satisfied, isInteger, nested, isFinite, plain };
export { isArray, callArg, isSafeInteger, callArgComputed, freeze, callArgStatic, keys, unclaimed };
