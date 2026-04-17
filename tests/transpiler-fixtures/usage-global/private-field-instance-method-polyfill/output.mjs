import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
class C {
  #bag = {
    at: () => null,
    flat: () => null
  };
  peek(i) {
    return this.#bag.at(i);
  }
  spread() {
    return this.#bag.flat();
  }
}