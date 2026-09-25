import _Array$from from "@core-js/pure/actual/array/from";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _String$raw from "@core-js/pure/actual/string/raw";
// a slot default fires only where the slot is undefined, and a key the literal lacks can still be
// inherited: `{}` lends `constructor` and `toString`, and a pattern `__proto__` key reads the
// prototype itself - none of these bindings is certainly its default, so pure guards each static
// read on the default's constructor and usage-global injects for it
const {
  constructor: C = Array
} = {};
export const viaConstructor = (C === Array ? _Array$from : C.from.bind(C))([1]);
const {
  toString: T = Object
} = {};
export const viaToString = (T === Object ? _Object$groupBy : T.groupBy.bind(T))([1], x => x);
const {
  __proto__: P = String
} = {};
export const viaPrototype = (P === String ? _String$raw : P.raw.bind(P))`x`;