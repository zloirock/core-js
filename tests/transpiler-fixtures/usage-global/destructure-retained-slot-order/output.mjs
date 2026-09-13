import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.values";
// A computed instance slot stays between retained siblings and their defaults.
// Each source key and getter runs once; rest excludes the consumed key.
// Assignment targets run before their reads and the assignment returns its RHS.
export function read(factory, key, fallback) {
  const {
    before = fallback(),
    [(key(), 'at')]: value = fallback(),
    after,
    ...rest
  } = factory();
  return [before, value, after, rest];
}
export function assign(factory, key, target, restTarget) {
  let value;
  return {
    before: target().value,
    [(key(), 'includes')]: value,
    after: target().value,
    ...restTarget().value
  } = factory();
}
export function assignMember(factory, key, target, restTarget) {
  return {
    [(key(), 'flatMap')]: target().value,
    ...restTarget().value
  } = factory();
}
export function assignPlain(factory, target) {
  return {
    before: target().x,
    find: target().y
  } = factory();
}
export function forwardDefault(factory, key) {
  const {
    [(key(), 'values')]: value = after,
    after
  } = factory();
  return [value, after];
}
export function coerced(factory, key, effect) {
  const {
    [key()]: first,
    [(effect(), 'findLast')]: value,
    ...rest
  } = factory();
  return [first, value, rest];
}