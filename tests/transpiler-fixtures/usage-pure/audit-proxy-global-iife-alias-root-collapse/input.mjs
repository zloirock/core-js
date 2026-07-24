// a proxy-global bound through a zero-arg IIFE (`const g = (() => globalThis)()`) names the same
// surface as a bare `const g = globalThis` alias, so `g.Array.from` collapses to the pure static -
// the alias-root classifier peels the wrapper exactly as the super-static and container resolvers do
const g = (() => globalThis)();
g.Array.from([1, 2, 3]);
