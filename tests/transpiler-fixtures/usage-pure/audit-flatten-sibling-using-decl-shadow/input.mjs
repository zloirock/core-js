// outer flatten of `globalThis` extracts `Array.from`. a sibling IIFE body declares
// `using globalThis = res()` (TC39 explicit-resource-management). per spec `using` is a
// block-scoped lexical binding shadowing the global throughout the body. the sibling-ref
// rewrite must treat `using` / `await using` as lexical, else `[globalThis]` is wrongly aliased
const { Array: { from } } = globalThis, val = (() => {
  using globalThis = makeResource();
  return [globalThis].values();
})();
declare function makeResource(): { [Symbol.dispose](): void };
export { from, val };
