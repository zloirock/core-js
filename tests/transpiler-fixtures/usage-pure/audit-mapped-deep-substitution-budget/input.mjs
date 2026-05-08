// Four nested generic alias hops, each adding a mapped wrapper, stay under the per-walk depth budget.
// Substitution must thread the original `T` through every layer so per-key narrows still fire.
type Step1<T> = { [K in keyof T]: T[K] };
type Step2<T> = Step1<{ [K in keyof T]: T[K] }>;
type Step3<T> = Step2<{ [K in keyof T]: T[K] }>;
type Step4<T> = Step3<{ [K in keyof T]: T[K] }>;
declare const r: Step4<{ a: number[]; b: string[] }>;
r.a.at(0);
r.b.includes('x');
