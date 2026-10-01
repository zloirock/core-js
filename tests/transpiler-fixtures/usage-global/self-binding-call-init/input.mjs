// A pattern whose init calls its own binding (`const { at } = at()`) invokes it before it holds
// anything. Proving that callee pairs the binding's slot from the very same call, so the proof stops
// at the binding with no callee: each method is injected by its claim and the source stays as written.
// Plain, optional, constructed, invoker, tagged, mutual and awaited spellings, plus a factory
// returning the call, plain and awaited.
const { at } = at();
var { includes } = includes?.();
const { flat } = new flat();
const { fill } = fill.call(null);
const { find } = find``;
const { map: first } = second(), { filter: second } = first();
function make() {
  return flatMap();
}
const { flatMap } = make();
export async function read() {
  const { findLast } = await findLast();
  return findLast;
}
export async function load() {
  async function fetchIndex() {
    return findLastIndex();
  }
  const { findLastIndex } = await fetchIndex();
  return findLastIndex;
}
