import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Set from "@core-js/pure/actual/set/constructor";
import _String$raw from "@core-js/pure/actual/string/raw";
// an instantiation over a substituted static goes with it, as a cast does: anywhere but the slot of a
// call, a `new` or a tag it only types the value it wraps. those three hosts take the type arguments
// over and keep them on the substituted binding
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tail = _Map$groupBy;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaCast = _Object$groupBy;
const memberTail = _nameMaybeFunction(_Array$from);
const argument = use(_Array$of);
const element = [_Promise$allSettled];
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const outerCast = _Promise$any;
const nonNull = _Iterator$from;
// NEGATIVE: the hosts that carry type arguments of their own
const call = _Promise$withResolvers<any>();
const ctor = new _Set<number>();
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tag = _String$raw<any>`t`;
export const r = [tail, viaCast, memberTail, argument, element, outerCast, nonNull, call, ctor, tag];