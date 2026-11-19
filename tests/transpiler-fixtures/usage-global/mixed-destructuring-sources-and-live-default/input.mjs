// A literal owns its native slot. The realm and each live default can be served independently.
export function run(user) {
  const seen = [];
  for (const { Array: { of } } of [globalThis, { Array: user }]) seen.push(typeof of);
  const [{ MissingObject: { fromEntries } = Object }] = [globalThis];
  return [seen, fromEntries([['value', 7]])];
}
export function select(flag) {
  const { C: { groupBy } } = flag ? { C: Map } : { C: Object };
  return groupBy;
}
