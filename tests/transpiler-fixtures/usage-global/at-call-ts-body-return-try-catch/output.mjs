import "core-js/modules/es.array.at";
function getData() {
  try {
    return [1, 2, 3];
  } catch (e) {
    return [4, 5];
  }
}
getData().at(-1);