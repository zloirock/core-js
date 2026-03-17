import "core-js/modules/es.array.at";
function getItems(cond) {
  if (cond) {
    try {
      return 'not-an-array';
    } finally {
      return ['a', 'b'];
    }
  }
  return ['c', 'd'];
}
getItems().at(0);