function getItems() {
  try {
    try {
      return 'not-an-array';
    } finally {
      return ['a', 'b'];
    }
  } catch (e) {
    return ['c'];
  }
}
getItems().at(0);
