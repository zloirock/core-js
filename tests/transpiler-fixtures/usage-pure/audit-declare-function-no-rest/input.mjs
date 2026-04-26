// `declare function` without rest params is purely type-only and must not produce any
// imports for the declaration itself; the standalone `x.at(0)` call still polyfills.
declare function fn(a: number, b: string): void;
declare const x: Parameters<typeof fn>[1];
x.at(0);
