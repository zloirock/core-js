import "core-js/modules/es.array.at";
function getArr(): number[] {
  return [];
}
function wrapper() {
  return getArr();
}
wrapper().at(-1);