import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// `type Q = typeof ref` aliases a `typeof` query to a class binding; `declare const m: Q` indirects through it.
// Static-method return types must resolve through the alias to emit precise Array vs String polyfills.
class Mod {
  static fetchOne(): string[] {
    return [];
  }
  static fetchTwo(): string {
    return '';
  }
}
const ref = Mod;
type Q = typeof ref;
declare const m: Q;
_findLastMaybeArray(_ref = m.fetchOne()).call(_ref, s => s);
_atMaybeArray(_ref2 = m.fetchOne()).call(_ref2, 0);
_includesMaybeString(_ref3 = m.fetchTwo()).call(_ref3, 'z');