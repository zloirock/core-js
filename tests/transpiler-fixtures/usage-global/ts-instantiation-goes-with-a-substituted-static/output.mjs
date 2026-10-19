import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
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
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// the global counterpart: a static read under an instantiation, alone or with casts and a non-null,
// is detected in every position - the slot of a call, a `new` or a tag, which takes the type arguments
// over in pure, and everywhere else, where pure drops them with the claim
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tail = Map.groupBy<any>;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaCast = (Object.groupBy as any)<any>;
const memberTail = (Array.from<any>).name;
const argument = use(Array.of<any>);
const element = [Promise.allSettled<any>];
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const outerCast = (Promise.any as any)<any> as unknown;
const nonNull = Iterator.from!<any>;
// the hosts that carry type arguments of their own
const call = Promise.withResolvers<any>();
const ctor = new Set<number>();
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tag = String.raw<any>`t`;
export const r = [tail, viaCast, memberTail, argument, element, outerCast, nonNull, call, ctor, tag];