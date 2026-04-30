import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// multi-decl flatten with sibling that locally shadows the receiver via `for (const
// globalThis of [...])`. ForOfStatement's `left` must contribute its `let`/`const`
// bindings to the scope frame for the loop body and update slot. without ForOfStatement
// scope tracking, the inner reference would be rewritten despite the shadow
const y = (() => {
  const tags = ['a', 'b'];
  for (const globalThis of tags) {
    if (globalThis === 'b') return globalThis;
  }
  return 'fallback';
})();
export { from, y };