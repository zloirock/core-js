// Baseline mapped passthrough without modifiers — should resolve subst correctly to Array
type Copy<T> = { [K in keyof T]: T[K] };
declare function probe<T>(arg: T): Copy<T>;
const r = probe<{ data: number[] }>(null!);
r.data.at(0);
