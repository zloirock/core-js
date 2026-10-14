import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
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
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.keys";
// the receiver's live `?.` can be an optional CALL: the callee's lookup takes the test and the call's
// result is read plainly by the method above it, so a result that comes out nullish throws there, as the
// source does. a method the build serves memoizes its lookup over the receiver - a tested receiver as a
// test of its own ahead of it - and one it does not keeps the plain member read
const box = globalThis.box;
export const servedLookup = box.list.flat?.().flatMap?.(x => [x]).at(0);
export const rawLookup = box.list.pick?.().toSorted?.().includes(1);
export const testedReceiver = box.list?.toReversed?.().findLast?.(Boolean).toFixed(1);
export const behindMemberLink = box?.list.toSpliced?.(0, 1).with?.(0, 1).keys();