import "core-js/modules/es.array.at";
function getData() {
  try {
    load();
  } catch (e) {
    return;
  }
  return [1, 2, 3];
}
getData().at(-1);