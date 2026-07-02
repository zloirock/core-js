import "core-js/modules/es.array.at";
function getItems() {
  try {
    try {
      return 'inner';
    } finally {
      return 'also-not-array';
    }
  } finally {
    return ['a', 'b'];
  }
}
getItems().at(0);