import "core-js/modules/es.array.at";
import "core-js/modules/es.string.small";
const obj = {
  get items() {
    return () => ['x', 'y'];
  }
};
obj.items().at(0).small();