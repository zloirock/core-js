import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Reflect from "@core-js/pure/actual/reflect";
// Decided selections expose their live container to later member analysis.
// Direct member statics remain served while nested destructuring retains native slot reads.
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
  C: _Reflect
};
export const viaPattern = () => getOwnPropertyDescriptor({
  a: 1
}, 'a');