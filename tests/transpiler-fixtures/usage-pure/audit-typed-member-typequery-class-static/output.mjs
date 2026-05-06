import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// resolveTypedMember TSTypeQuery branch routed THROUGH a type alias: `type Q = typeof ref`,
// `declare const m: Q`. annotation on `m` is TSTypeReference 'Q' (not TSTypeQuery directly),
// so resolveTypedMember peels the alias chain via `followTypeAliasChain` to reach the
// TSTypeQuery node. resolveTypeQueryBinding then follows `typeof ref` -> ref's init Mod
// (Identifier) -> resolvePath walks to the ClassDeclaration. resolveClassMember fires for
// each static method, returning their declared return types. distinct methods so each
// return type tracks back to its specific class signature; both string[] (Array narrow)
// and string (String narrow) emit precise polyfill imports
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