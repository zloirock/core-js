import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// An `Object.assign` / `Object.defineProperties` source given as a const-bound variable resolves to its
// object-literal init, so a copied static key is recorded like an inline literal source - the patch is
// detected and the static read routes through the ponyfill constructor. a const aliased to another const
// (`const aliasSrc = baseSrc`) follows the whole chain to the literal. distinct statics pin which source
// shape was detected.
const assignSrc = {
  groupBy: patchA
};
_Object$assign(_Map, assignSrc);
const r1 = _Map.groupBy(items, fn);
const propsSrc = {
  try: {
    value: patchB
  }
};
_Object$defineProperties(_Promise, propsSrc);
const r2 = _Promise.try(fn);
const baseSrc = {
  from: patchC
};
const aliasSrc = baseSrc;
_Object$assign(_Iterator, aliasSrc);
const r3 = _Iterator.from(src);
export { r1, r2, r3 };