// The inner default supplies Map.groupBy. A caller can supply both properties.
function f({ a: { b: { entries, groupBy } = Map } = { b: undefined } } = { a: undefined }) {
  return [entries, groupBy];
}
export { f };
export const groups = f()[1]([3], x => x).get(3);
export const supplied = f({ a: { b: { entries: 1, groupBy: 2 } } });
