// chain-assign + nested-fallback combo: `foo = cond1 ? (cond2 ? Array : Iterator) : Set`.
// `peelFallbackReceiver` alternates chain-assign / paren / TS / safe-SE peels until stable;
// recursive `flattenFallbackBranches` then walks the inner conditional. all four polyfills
// (Array.from, Iterator.from, Set.from-side, plus their constructor deps) load
const { from } = foo = cond1 ? (cond2 ? Array : Iterator) : Set;
from([1, 2]);
