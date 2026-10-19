// a for-of head whose iterated LITERAL stands behind parentheses, with a body that writes the
// element's slot: the write is seen through the wrapper like every other reader of the head, so the
// slot may hold either constructor - the global flavor still loads the module of the static the
// literal put there
const out = [];
for (const item of ([{ w: Object }])) {
  // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
  item.w = Array;
  const viaParenWrittenSlot = item.w.assign;
  out.push(viaParenWrittenSlot);
}
export { out };
