import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// Private methods cannot be overridden, so their concrete body remains authoritative.
class Base {
  #value(): string | number[] {
    return 'ab';
  }
  last() {
    return this.#value().at(-1);
  }
}
export { Base };