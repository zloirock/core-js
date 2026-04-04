function getItems() {
  try {
    return 'not-an-array';
  } finally {
    return ['a', 'b'];
  }
}
getItems().at(0);
