import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// pattern-LHS reassignments flow their slot values into the usage-global union: the receiver
// resolves the reaching Iterator (dead Array init dropped by the dominating write) and the
// computed key resolves the reaching slot string, each injecting its method entry
let A = Array;
[A] = [Iterator];
export const r1 = A.from(y);
let K = 'from';
[K] = ['of'];
export const r2 = Array[K](1);
// a hole shifts the pairing but the slot still pairs positionally
let O = Array;
[, O] = [x, Object];
export const r3 = O.groupBy(items, fn);
// a slot DEFAULT is a reachable value too (it applies on an undefined slot)
let F = Array;
[F = Object] = [maybe];
export const r4 = F.fromEntries(entries);
// object-pattern slots pair by key
let P = Array;
({
  p: P
} = {
  p: Promise
});
export const r5 = P.try(fn);
// logical assignment flows its RHS as a reachable value
let M = Array;
M ||= Map;
export const r6 = M.groupBy(items, fn);
// optional / wrapped mutation targets classify in global mode too (imports still injected)
delete Iterator?.toArray;
Map.customGlobParen ||= globShim;