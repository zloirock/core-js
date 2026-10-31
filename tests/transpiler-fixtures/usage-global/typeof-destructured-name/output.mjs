import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `typeof` of a destructured name never reads the pattern's initializer or annotation, which type
// the container: the array the name came out of is no array helper's receiver
const [first] = ['a'];
export function lastOf(value: typeof first) {
  return value.at(-1);
}
const {
  label
} = {
  label: 'x'
};
export function hasIn(value: typeof label, part: string) {
  return value.includes(part);
}