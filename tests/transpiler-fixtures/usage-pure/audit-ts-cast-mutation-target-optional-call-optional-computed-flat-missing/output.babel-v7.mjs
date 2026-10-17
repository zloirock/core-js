import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// an ENUM-member computed key names its member like every other spelling of that key: detection
// asks the TYPE layer's key-name resolver, which owns the enum fold (shadowing gate, merged blocks),
// instead of keeping a boundary the other spellings did not have - a literal, a template and a
// const-bound identifier chain all claimed here while the enum member alone stayed raw
enum HopKeys {
  MAP = 'map',
}
export const r5 = _flatMaybeArray(arr)?.call(arr)[HopKeys.MISSING](f);