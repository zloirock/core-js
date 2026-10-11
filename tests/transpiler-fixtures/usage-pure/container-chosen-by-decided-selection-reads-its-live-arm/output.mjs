import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Reflect$getOwnPropertyDescriptor from "@core-js/pure/actual/reflect/get-own-property-descriptor";
// a container a test the build decides selects is the one it always yields, so a static read through it
// is that container's own: chosen for an alias, in a slot, nested, spelled in place, and under a pattern
const aliased = {
  C: _Map
};
export const viaAlias = () => _Map$groupBy([1], x => x);
const inSlot = {
  C: _Iterator
};
export const viaSlot = () => _Iterator$from([1]);
const nested = {
  inner: {
    C: _Promise
  }
};
export const viaNested = () => _Promise$withResolvers();
export const inPlace = () => _Array$fromAsync([]);
const {
  C: {
    getOwnPropertyDescriptor
  }
} = {
  C: {
    getOwnPropertyDescriptor: _Reflect$getOwnPropertyDescriptor
  }
};
export const viaPattern = () => getOwnPropertyDescriptor({
  a: 1
}, 'a');