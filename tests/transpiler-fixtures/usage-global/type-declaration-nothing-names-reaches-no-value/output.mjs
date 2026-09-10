import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// a type REFERENCE injects because a value of that type may flow here and be read through it - that
// is the annotation lane's standing convention, and the read below proves it load-bearing. but a type
// DECLARATION nothing in this file names declares a surface no value here can have, so no read ever
// reaches its mentions and the convention has nothing to serve. an EXPORTED declaration keeps
// injecting: its readers are other files, whose type resolution does not cross the import.
// one global per row so a dropped one shows in the import set
interface NobodyNames {
  m(): Map<string, number>;
}
type AlsoUnnamed = Set<string>;
// ... while these are named, so what they carry still flows
interface Named {
  m(): WeakMap<object, number>;
}
declare const named: Named;
export const read = named.m();
type NamedAlias = WeakSet<object>;
declare const aliased: NamedAlias;
export const alsoRead = aliased;
// ... and an EXPORTED declaration nothing here names keeps its mentions for the files that import it
export interface Shared {
  m(): Promise<number>;
}