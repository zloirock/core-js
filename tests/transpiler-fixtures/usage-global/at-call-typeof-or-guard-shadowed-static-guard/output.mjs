import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a `typeof`-OR group is parsed in the test's own scope like any other test: a user-shadowed
// `Number` is no built-in there, so its `.isFinite` contributes no `number` disjunct and the group
// narrows nothing - both families inject. the same shadow outside an OR group already declined;
// the unshadowed group beside it narrows to string and number, so only the string family injects
const Number = {
  isFinite: () => true
};
export function shadowed(x) {
  if (typeof x === 'string' || Number.isFinite(x)) return x.at(0);
  return null;
}
export function plain(x) {
  if (Number.isFinite(x)) return x.map(v => v);
  return null;
}
export function unshadowed(x) {
  if (typeof x === 'string' || globalThis.Number.isFinite(x)) return x.includes('a');
  return null;
}