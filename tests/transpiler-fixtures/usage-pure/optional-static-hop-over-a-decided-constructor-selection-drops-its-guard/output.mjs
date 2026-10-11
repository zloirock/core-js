import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _self from "@core-js/pure/actual/self";
// a `?.` over a selection the build decides for a constructor guards that constructor alone, and the
// static claim on the hop substitutes it: the guard is dead and the hop reads the static's own entry,
// behind an effect prefix too. a selection deciding for a realm navigation keeps its guard
let n = 0;
export const grouped = _nameMaybeFunction(_Map$groupBy);
export const resolved = _nameMaybeFunction((n++, _Promise$withResolvers));
export const iterated = _nameMaybeFunction(_Iterator$from);
export const flattened = null == _self ? void 0 : _flatMaybeArray(_self.Array.prototype);