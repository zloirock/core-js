// an exported destructure with a rest sibling splits into an exported extraction and a kept rest
// level: the claimed static leaves the pattern as an exported binding of its own, while the rest keeps
// its source with the claimed key as an exclusion, so it copies the keys the source copies.
export const { Array: { from }, ...rest } = globalThis;
[from, rest];
