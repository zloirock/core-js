import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `typeof` of a destructured name never reads the pattern's initializer or annotation, which type
// the container: the array the name came out of is no array helper's receiver
const [first] = ['a'];
export function lastOf(value: typeof first) {
  return _at(value).call(value, -1);
}
const {
  label
} = {
  label: 'x'
};
export function hasIn(value: typeof label, part: string) {
  return _includes(value).call(value, part);
}