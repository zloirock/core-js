import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Set from "@core-js/pure/actual/set/constructor";
// a member read off a `||` / `??` whose left is a for-of head over built-ins, the right dead, reads as the
// head spelled alone: the identity guard over the elements owning the static, re-reading the head even
// where the right is no global the dead part folds away, a sole element's static itself, an effect prefix
// kept ahead of the guard, the read's own `?.` kept on its raw branch
for (const M of [_Map, _Set]) use(M === _Map ? _Map$groupBy : M.groupBy);
for (const R of [_Promise, _Set]) use(R === _Promise ? _Promise$allSettled : R.allSettled);
for (const P of [_Promise]) use(_Promise$try);
for (const I of [_Iterator, _Set]) use((n(), I === _Iterator ? _Iterator$from : I.from));
for (const A of [Array, _Set]) use(A === Array ? _Array$fromAsync : A?.fromAsync);
for (const {
  C
} of [{
  C: _Promise
}, {
  C: _Set
}]) use((C === _Promise ? _Promise$withResolvers : C.withResolvers.bind(C))());