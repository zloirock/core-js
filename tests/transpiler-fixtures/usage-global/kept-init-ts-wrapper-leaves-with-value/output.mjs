import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A TS wrapper around an init a static claim empties: this method rewrites no init, so each wrapper
// stays where the source wrote it, and the static every row reads keeps its module whatever wraps it;
// a left the build serves (`globalThis.Array`, `globalThis.Object`) leaves its right dead - no `Set` module.
const {
  of
} = (globalThis.Array || (log(), Set)) as any;
let from: any;
({
  from
} = (log(), globalThis.Array || Set) as ArrayConstructor);
const {
  fromEntries
} = (log(), globalThis).Object!;
if (ok) var {
  fromAsync
} = (globalThis.Array ?? make()) satisfies unknown;
let hasOwn: any;
if (ok) ({
  hasOwn
} = (log(), globalThis.Object || Set) as any);
if (ok) var {
  entries
} = (log(), globalThis).Object as any;
export { of, from, fromEntries, fromAsync, hasOwn, entries };