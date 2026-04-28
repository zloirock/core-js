import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `declare class { m(...args) }` parses with MethodDefinition.value as
// TSEmptyBodyFunctionExpression. Without rest-param neutralization the scope crawler
// throws. Unrelated string binding below confirms the file-level transform completes
declare class C {
  m(...args: number[]): void;
}
declare const s: string;
_atMaybeString(s).call(s, -1);