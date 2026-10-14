// A default over a SELECTION of receivers stays live, however the build serves one arm's static: another arm may
// lack it, so the default runs there and its writes reach the reads below.
export function selected(flag) {
  let list = [3, 4];
  const { from = (list = 'ab') } = flag ? Array : Set;
  return [from, list.at(-1)];
}
export function guarded(flag) {
  let list = [3, 4];
  const { groupBy = (list = 'ab') } = flag && Map;
  return [groupBy, list.at(-1)];
}
export function either(source) {
  let list = [3, 4];
  const { from = (list = 'ab') } = source || Array;
  return [from, list.at(-1)];
}
export function assigned(flag) {
  let list = [3, 4];
  let from;
  ({ from = (list = 'ab') } = flag ? Array : Set);
  return [from, list.at(-1)];
}
