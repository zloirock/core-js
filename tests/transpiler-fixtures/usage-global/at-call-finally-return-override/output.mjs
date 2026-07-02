import "core-js/modules/es.array.at";
function getItems() {
  try {
    return 'not-an-array';
  } finally {
    return ['a', 'b'];
  }
}
getItems().at(0);