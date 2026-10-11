import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// a pattern on a function's parameter reads its keys off whatever a caller passes, so an instance key
// loads the module of every owner of that key, as a key read off any receiver the build cannot type -
// a declaration, an arrow, a method and a leaf with a default of its own alike
export function first({
  at
}) {
  return at;
}
export const pad = ({
  padStart
}) => padStart;
export const host = {
  pick({
    findLast
  }) {
    return findLast;
  }
};
export function flatten({
  flat = null
}) {
  return flat;
}