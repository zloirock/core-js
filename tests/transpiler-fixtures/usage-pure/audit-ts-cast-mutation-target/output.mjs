import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map2 from "@core-js/pure/actual/map";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
var _ref, _ref2, _ref3;
// a mutation target behind stacked wrappers (TS cast, doubled parens) still records: the
// classification peels DOWNWARD from the mutation host, so wrapper depth is unbounded
delete (_Map.groupBy as any);
export const r1 = _Map.groupBy(x, f);
_Iterator.from ||= shim;
export const r2 = _Iterator.from(it);
Object.defineProperty(_Map2, 'groupBy', {
  value: dpPatch
});
export const r3 = _Map.groupBy(y, g);
// an ENUM-member computed key names its member like every other spelling of that key: detection
// asks the TYPE layer's key-name resolver, which owns the enum fold (shadowing gate, merged blocks),
// instead of keeping a boundary the other spellings did not have - a literal, a template and a
// const-bound identifier chain all claimed here while the enum member alone stayed raw
enum HopKeys {
  MAP = 'map'
}
export const r4 = null == (_ref = _flatMaybeArray(arr)) || null == (_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, f)) ? void 0 : _at(_ref2).call(_ref2, 0);
// ... and the NEGATIVES of that arm, so a later widening cannot swallow them: a member the enum
// does not declare, a plain object property that merely looks like one, an object literal keyed the
// same way, and a dynamic key all name nothing and leave the read raw
declare const dynKey: string;
const plainObj = {
  MAP: 'map'
};
export const r5 = _flatMaybeArray(arr)?.call(arr)[HopKeys.MISSING](f);
export const r6 = _flatMaybeArray(arr)?.call(arr)[plainObj.MAP](f);
export const r7 = _flatMaybeArray(arr)?.call(arr)[dynKey](f);
// ... and the enum whose SLOT the program rewrites: the declared value is no longer the runtime key,
// so the claim stands down whichever channel does the rewriting - a member write, or a call handed
// the container itself (the write index is keyed by assigned field and cannot see the second)
enum Patched {
  MAP = 'map'
}
(Patched as any).MAP = 'filter';
enum Assigned {
  MAP = 'map'
}
_Object$assign(Assigned, {
  MAP: 'filter'
});
export const r8 = _flatMaybeArray(arr)?.call(arr)[Patched.MAP](f);
export const r9 = _flatMaybeArray(arr)?.call(arr)[Assigned.MAP](f);
// ... including the patch that travels through an ALIAS of the container, which the escape census
// follows and a per-name walk of the calls alone would miss
enum Aliased {
  MAP = 'map'
}
const aliasOfEnum = Aliased;
_Object$assign(aliasOfEnum, {
  MAP: 'filter'
});
export const r10 = _flatMaybeArray(arr)?.call(arr)[Aliased.MAP](f);