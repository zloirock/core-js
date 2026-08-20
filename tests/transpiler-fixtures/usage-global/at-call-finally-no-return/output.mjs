import "core-js/modules/es.array.at";
function getItems() {
  try {
    return ['a', 'b'];
  } catch (e) {
    return ['c'];
  } finally {
    cleanup();
  }
}
getItems().at(0);