import "core-js/modules/es.array.at";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.sub";
class Store {
  #items: string[] = [];
  get getItems() {
    return () => this.#items.slice();
  }
}
new Store().getItems().at(0).sub();