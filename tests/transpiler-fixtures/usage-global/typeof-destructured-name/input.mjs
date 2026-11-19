// `typeof` of a destructured name never reads the pattern's initializer or annotation, which type
// the container: the array the name came out of is no array helper's receiver
const [first] = ['a'];
export function lastOf(value: typeof first) {
  return value.at(-1);
}
const { label } = { label: 'x' };
export function hasIn(value: typeof label, part: string) {
  return value.includes(part);
}
