import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
function undecided() {
  if (globalThis.flag) return 'abc';
  return [1];
}
export const fromUndecided = undecided().slice(1);