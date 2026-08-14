import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array-buffer.constructor";
import "core-js/modules/es.array-buffer.detached";
import "core-js/modules/es.array-buffer.transfer";
import "core-js/modules/es.array-buffer.transfer-to-fixed-length";
import "core-js/modules/es.array-buffer.species";
import "core-js/modules/es.array-buffer.to-string-tag";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// type arguments are type-only but they name runtime globals, and folding the instantiation hands
// the whole list to the host above it - the sweep has to keep reaching them at their new owner.
// one global per line: injection is observable only through the import set here, so two lines
// sharing a global would mask each other. the tail lines keep the instantiation node instead
declare const f: any;
const foldCall = (f as any)<Map<string, number>>([1]);
const foldNew = new (f as any)<Set<number>>();
const foldTag = (f as any)<WeakMap<object, number>>`t`;
const foldOptionalCall = (f as any)<Promise<number>>?.([1]);
const keptMemberTail = ((f as any)<WeakSet<object>>).name;
const keptBareValue = (f as any)<ArrayBuffer>;
export const r = [foldCall, foldNew, foldTag, foldOptionalCall, keptMemberTail, keptBareValue];