// `function f<T, U extends any[] = T[]>(t: T): U` with `f(v)` - T inferred from typed
// arg, U omitted. before fix, partial-inferred Map{T} skipped the `??` default-fallback;
// downstream typeparam-scope lookup recovered U as TSTypeReference but lost the inferred
// T binding when walking U`s default `T[]` (T scope-lookup had no value). result: x[0]
// resolved to null instead of string, .at(0) fell to generic polyfill instead of string
declare function makeBox<T, U extends any[] = T[]>(t: T): U;
declare const v: string;
const x = makeBox(v);
export const r = x[0].at(0);