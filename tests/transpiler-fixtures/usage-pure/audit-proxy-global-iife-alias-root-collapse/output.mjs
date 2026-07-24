import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a proxy-global bound through a zero-arg IIFE (`const g = (() => globalThis)()`) names the same
// surface as a bare `const g = globalThis` alias, so `g.Array.from` collapses to the pure static -
// the alias-root classifier peels the wrapper exactly as the super-static and container resolvers do
const g = (() => _globalThis)();
_Array$from([1, 2, 3]);