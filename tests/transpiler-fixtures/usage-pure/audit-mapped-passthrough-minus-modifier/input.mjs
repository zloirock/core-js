// `-readonly` and `-?` modifiers strip flags but preserve the value type;
// passthrough detection should still recover the original element type for dispatch
type Required2<T> = { [K in keyof T]-?: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
declare const r: Required2<{ a?: number[] }>;
declare const m: Mutable<{ readonly a: string[] }>;
r.a.at(0);
m.a.includes("x");
