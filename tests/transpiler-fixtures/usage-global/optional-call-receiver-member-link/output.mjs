import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.with";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.number.to-exponential";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.keys";
// an optional method call whose receiver carries a live `?.` short-circuits at that link alone: the
// guard tests the link's object and the method is read off the receiver plainly past it, so a receiver
// that comes out nullish below the link throws at the method read, as the source does. a `?.` on the
// method member itself tests the receiver's own value instead
const box = globalThis.box;
const key = 'list';
export const optionalOuter = box?.list.flatMap?.(x => [x]).toSorted?.();
export const plainOuter = box?.list.flat?.().at(0);
export const optionalResult = box?.list.findLast?.(Boolean)?.toFixed(1);
export const getTail = box?.list.toReversed?.().with;
export const computedLink = box?.[key].findLastIndex?.(Boolean).toExponential(1);
export const deeperLink = box?.inner?.list.toSpliced?.(0, 1).includes(1);
// NEGATIVE: the method member's own `?.` tests the receiver value
export const ownOptional = box?.list?.fill?.(0).keys();