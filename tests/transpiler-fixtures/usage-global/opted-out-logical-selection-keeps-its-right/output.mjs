import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A `||` / `??` on a line the user opted out of decides nothing: its right stays live, so usage-global
// injects what each arm reads and a pattern reading it mirrors each arm, as it does for an opted-out
// ternary - the selection never collapses to its left.
// core-js-disable-next-line
export const {
  groupBy
} =
// core-js-disable-next-line
Map || Object;
// core-js-disable-next-line
export function f({
  from
} =
// core-js-disable-next-line
Array ?? fallback) {
  return from;
}
export const {
  C: {
    try: attempt
  }
} = {
  // core-js-disable-next-line
  C: Promise || Thenable
};