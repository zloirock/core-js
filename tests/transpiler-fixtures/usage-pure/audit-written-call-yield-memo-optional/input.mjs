// what a KEPT WRITE proves about the `?.` sitting on it, asked in the MEMO spelling. a written
// CALL YIELD proves nothing: proving WHICH global a call returns is not proving it returns a
// defined one, so the memo keeps the source `?.` - erasing it turned a short-circuit into a
// throw off-engine. inside a RENDERED hop drop the prefix IS the test's own read, and there the
// proven inline call proves the way a write proves everywhere, so that spelling stays plain.
const ca = () => globalThis;
const ca2 = () => globalThis;
let held, heldRoot;
// a written CALL yield keeps its `?.` in the memo
export const writtenCall = (held = ca())?.window?.Array.of(1).at(0);
// inside a RENDERED drop the same written call reads plain: the prefix IS the test
export const renderedDrop = (heldRoot = ca2())?.window?.self?.Array.of(3).at(0);
export { held, heldRoot };
