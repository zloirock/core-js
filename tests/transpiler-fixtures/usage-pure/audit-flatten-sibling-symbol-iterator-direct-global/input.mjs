// Flatten with a `[Symbol.iterator]` sibling and a direct `globalThis` receiver (no
// alias). The synthesized extraction reuses the original-source receiver slice
// `globalThis`, and the standalone `globalThis -> _globalThis` substitution must reach
// that slice so the emit becomes `_getIteratorMethod(_globalThis)`. If the substitution
// is lost, the extraction calls the unpolyfilled `globalThis` and fails at runtime on
// old engines that lack a native `globalThis` binding.
const { Array: { from }, [Symbol.iterator]: iter } = globalThis;
console.log(from, iter);
