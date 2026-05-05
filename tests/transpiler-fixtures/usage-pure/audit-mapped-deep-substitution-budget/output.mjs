import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// Per-walk depth budget in applyAliasSubstDeep / followTypeAliasChain holds for nested
// generic alias hops + a mapped type per hop. Each hop wraps the source one level deeper.
// Distinct prototype methods per line probe per-hop dispatch
type Step1<T> = { [K in keyof T]: T[K] };
type Step2<T> = Step1<{ [K in keyof T]: T[K] }>;
type Step3<T> = Step2<{ [K in keyof T]: T[K] }>;
type Step4<T> = Step3<{ [K in keyof T]: T[K] }>;
declare const r: Step4<{
  a: number[];
  b: string[];
}>;
_at(_ref = r.a).call(_ref, 0);
_includes(_ref2 = r.b).call(_ref2, 'x');