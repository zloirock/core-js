// A fully consumed destructuring ASSIGNMENT whose init is a realm read under an effectful KEY keeps that
// read, once, as its own statement ahead of the extraction: a constructor with no pure constructor entry
// (`Array`, `Object`) keeps the realm root and spells the read off it, one with an entry (`Map`) swaps
// whole. The key's effect runs exactly as often as the source runs it.
let c = 0;
let of, fromEntries, groupBy;
({ of } = globalThis[(c++, 'Array')]);
({ fromEntries } = globalThis[(c++, 'Object')]);
({ groupBy } = globalThis[(c++, 'Map')]);
export { of, fromEntries, groupBy, c };
