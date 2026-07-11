import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5;
// `keyof T` privacy keys on the AST discriminator: a real `#priv` member is excluded per
// TS spec, while a PUBLIC member SPELLED '#weird' (string-literal key) is a normal key and
// must survive a NON-passthrough mapped expansion (the passthrough form substitutes to the
// source directly and never exercised the filter)
interface Src {
  '#weird': number[];
  regular: string[];
}
type NonPass = { [K in keyof Src]: readonly Src[K][] };
declare const m: NonPass;
export const hashKey = _atMaybeArray(_ref = m['#weird'] as any).call(_ref, 0);
export const plainKey = _includesMaybeArray(_ref2 = m.regular as any).call(_ref2, 's');

// an `as`-remapped keyof expansion applies the same AST-keyed privacy filter
type Remapped = { [K in keyof Src as K]: readonly Src[K][] };
declare const rm: Remapped;
export const remapped = _atMaybeArray(_ref3 = rm['#weird'] as any).call(_ref3, 2);
class WithPriv {
  #secret = 1;
  open = 2;
}
type FromClass = { [K in keyof WithPriv]: number[] };
declare const c: FromClass;
export const survivor = _atMaybeArray(_ref4 = c.open as any).call(_ref4, 1);
// the real private probed via bracket is EXCLUDED from the mapped keys - the member type
// is unknown and the dispatch stays generic (a typed Maybe here would mean the filter leaked)
export const excluded = _at(_ref5 = c['#secret'] as any).call(_ref5, 3);