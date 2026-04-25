// destructure with default value on `.prototype` key: `const { prototype: P = fallback } = Set`.
// when Set.prototype is defined (normal case), P binds to Set.prototype; default is only
// reached if Set is undefined. plugin treats P as the prototype of Set (instance surface),
// so `.union(...)` routes to the Set instance polyfill. AssignmentPattern wrapper on p.value
// must be peeled to recover the underlying Identifier
const { prototype: P = { union() {} } } = Set;
P.union(new Set([1, 2]));
