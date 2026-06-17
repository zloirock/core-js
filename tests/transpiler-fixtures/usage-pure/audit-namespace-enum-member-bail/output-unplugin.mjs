import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `resolveEnumMemberAccess` and `resolveComputedKeyName` only accept `key.object.type ===
// 'Identifier'` for enum member dispatch. Namespace-qualified `NS.E.A` has `key.object` =
// MemberExpression(NS,E), so the enum lookup is skipped. The receiver dispatch falls through
// to generic; computed key with namespaced enum bails to dynamic. Distinct methods probe
// the resolution.
namespace NS {
  export enum E {
    A,
    B,
  }
}
declare const v: NS.E;
const tag = String(v);
_atMaybeString(tag).call(tag, 0);
tag.findLast(c => c === 'A');