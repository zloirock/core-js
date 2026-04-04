import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
const items = getItems();
function getItems() {
  return items || [];
}
items.at(0);