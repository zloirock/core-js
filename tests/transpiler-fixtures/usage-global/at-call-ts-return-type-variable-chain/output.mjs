import "core-js/modules/es.array.at";
function getArr(): number[] {
  return [];
}
const fn = getArr;
fn().at(-1);