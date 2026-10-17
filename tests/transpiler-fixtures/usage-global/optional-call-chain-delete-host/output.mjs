import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.dom-collections.iterator";
// a `delete` of a member the continuation of a combined dispatch runs on into takes the whole
// operator into the guard: a short-circuit answers true, and otherwise the member is deleted for
// real - absorbed into the alternate it was only read. the dispatch's own result is no member, so
// deleting it keeps the operator around the guard
const box = globalThis.box;
export const plainReceiver = delete box.list.flat?.().at(0).k;
export const liveLink = delete box?.list.toSorted?.().findLast(Boolean).k;
export const optionalTail = delete box.list.toReversed?.().find(Boolean)?.k;
// NEGATIVE: the dispatch's own result is deleted as written
export const ownResult = delete box.list.flatMap?.(x => [x]).includes(1);