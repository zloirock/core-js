import "core-js/modules/es.array.at";
import "core-js/modules/es.string.fontcolor";
const createItems = () => ['a', 'b', 'c'];
class Cls {
  get items() {
    return createItems;
  }
}
new Cls().items().at(0).fontcolor('red');