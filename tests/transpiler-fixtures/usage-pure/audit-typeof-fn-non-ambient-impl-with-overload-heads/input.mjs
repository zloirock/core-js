// non-ambient `function fn` impl preceded by `function fn` overload heads (TSDeclareFunction
// in babel TS). TS resolves `ReturnType<typeof fn>` against the LAST DECLARED head, which
// here is `(x: number): number[]`. so `r` is `number[]` and `r.at(0)` must narrow to the
// Array-specific polyfill (`_atMaybeArray`). without the impl-with-heads branch in
// `pickLastAmbientOverload`, the resolver picks the impl's return type (`any`) and the
// narrow drops to generic `_at` - or worse, polyfill emission bails entirely
function fn(x: string): string;
function fn(x: number): number[];
function fn(x: any): any { return null as any; }
const r: ReturnType<typeof fn> = fn(0);
r.at(0);
