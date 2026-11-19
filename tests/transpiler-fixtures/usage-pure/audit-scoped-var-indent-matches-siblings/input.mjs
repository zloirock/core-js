// optional-chain `.flat?.().at` inside a nested block requires `_ref` for safe-call
// caching. the queued `var _ref;` insertion at block start must pick up surrounding
// sibling indent, not start at column 0 - matches the inline-baked path's indent
function probe(arr) {
  if (arr) {
    const head = new (arr.flat?.().at)(0);
    return head;
  }
  return null;
}
export { probe };
