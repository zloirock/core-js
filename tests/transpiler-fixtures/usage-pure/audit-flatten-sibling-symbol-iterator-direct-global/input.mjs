// flatten with a `[Symbol.iterator]` sibling and a direct `globalThis` receiver (no
// alias). the synthesized extraction reuses the source receiver slice `globalThis`, and
// the `globalThis -> _globalThis` substitution must reach it so the emit becomes
// `_getIteratorMethod(_globalThis)` - else it calls an unpolyfilled `globalThis` on old engines
const { Array: { from }, [Symbol.iterator]: iter } = globalThis;
console.log(from, iter);
