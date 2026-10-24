// Moving a receiver into a capture or a rewritten expression preserves its inferred type. The later dispatch must use the same
// receiver family as the original source.
const flattenMemo = (function () {
  const nb = { y: [1, 2] };
  const { y: { at, other } } = nb;
  return [at, other];
})();
export { flattenMemo };
