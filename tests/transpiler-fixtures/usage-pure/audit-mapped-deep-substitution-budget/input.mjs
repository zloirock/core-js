// Per-walk depth budget in applyAliasSubstDeep / followTypeAliasChain holds for nested
// generic alias hops + a mapped type per hop. Each hop wraps the source one level deeper.
// Distinct prototype methods per line probe per-hop dispatch
type Step1<T> = { [K in keyof T]: T[K] };
type Step2<T> = Step1<{ [K in keyof T]: T[K] }>;
type Step3<T> = Step2<{ [K in keyof T]: T[K] }>;
type Step4<T> = Step3<{ [K in keyof T]: T[K] }>;
declare const r: Step4<{ a: number[]; b: string[] }>;
r.a.at(0);
r.b.includes('x');
