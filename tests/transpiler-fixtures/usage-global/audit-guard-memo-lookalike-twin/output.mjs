import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// the global twin of the memo-slot look-alike: nothing is memoized here and the source keeps its
// text, so the whole decision is the import set - which makes it the control for the pure side,
// where the same shapes route a guard memo and a twin occurrence through one positional slot.
// a DISTINCT method per row (receiver dispatch and twin alike), so a row that stops resolving
// leaves a hole in the module list instead of hiding behind a neighbour that spells the same name
export function pickLast(fn, o) {
  return o.items?.at(o.items.findLastIndex(fn));
}
export function trimBySum(fn, o) {
  return o.items?.flat(o.items.findIndex(fn));
}
export function padByNested(fn, o) {
  return o.text?.padStart(o.items.flatMap(fn).length);
}
export function plainTail(o) {
  return o.items?.includes(o.items.length - 1);
}