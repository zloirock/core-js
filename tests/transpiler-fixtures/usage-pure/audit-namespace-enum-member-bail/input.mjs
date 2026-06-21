// Enum member dispatch only fires when `key.object.type === 'Identifier'`. Namespace-
// qualified `NS.E.A` has `key.object` = MemberExpression(NS,E), so the enum lookup is
// skipped: receiver dispatch falls through to generic, computed key bails to dynamic.
// Distinct methods (at / findLast) probe the resolution.
namespace NS {
  export enum E {
    A,
    B,
  }
}
declare const v: NS.E;
const tag = String(v);
tag.at(0);
tag.findLast(c => c === 'A');
