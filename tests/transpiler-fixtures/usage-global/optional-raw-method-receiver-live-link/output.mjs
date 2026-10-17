import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a method the build does not serve takes the same split under a claim above it: the receiver's live
// `?.` is tested at its link and the method is read plainly off the receiver past it, so a receiver
// that comes out nullish below the link throws at that read. a `?.` on the method member itself reads
// the method optionally off the tested receiver instead
const box = globalThis.box;
const key = 'pick';
export const plainOuter = box?.list.pick?.().at(0);
export const computedMethod = box?.list[key]?.().flat();
export const deeperLink = box?.inner?.list.pick?.().findLast(Boolean);
export const optionalOuter = box?.list.pick?.().toSorted?.();
// NEGATIVE: the method member's own `?.` tests the receiver value
export const ownOptional = box?.list?.pick?.().includes(1);