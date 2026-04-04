import "core-js/modules/es.array.at";
function getArr(): number[] {
  return [];
}
const result = getArr();
const a = result;
const b = a;
const c = b;
b.at(-1);