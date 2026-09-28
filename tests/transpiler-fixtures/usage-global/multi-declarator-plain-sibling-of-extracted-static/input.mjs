// A plain declarator beside a static destructuring: the declaration splits around the extracted
// static, and the plain sibling's own claims keep resolving through its binding - in a function,
// at module level and in an exported declaration.
export function last(csv) {
  const parts = String(csv).split(','), { keys } = Object;
  return [parts.at(-1), keys(parts)];
}
export function flatten(list) {
  const copy = list, { from } = Array;
  return [copy.flat(), from(copy)];
}
const nested = [[1]], { of } = Array;
nested.flatMap(item => item);
of(1);
export const items = [1, 2], { entries } = Object, clone = items;
clone.includes(2);
entries(clone);
// an exported array wrapper: a later declarator reads the extracted leaf's binding
export let [{ findLastIndex: lastIndexOf }] = [[1]], lastIndex = lastIndexOf;
export const one = 1, [{ toSorted: sortedOf }] = [[1]], sorted = sortedOf;
export const names = [lastIndex.name, sorted.name];
