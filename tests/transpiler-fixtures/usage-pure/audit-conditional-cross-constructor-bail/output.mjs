import _at from "@core-js/pure/actual/instance/at";
// conditional with check and extends sides on different non-primitive constructors:
// `Array<number>` vs `Map`. structural sub-type relations across constructors exist
// (Array implements Iterable, etc), so we cannot decide either branch statically -
// fall through to the widened branch fold. the two branches don't share a common
// outer, so the result widens to unknown and the generic instance polyfill is emitted
type Foo<T> = T extends Map<unknown, unknown> ? string[] : number;
declare function probe<T>(): Foo<T>;
const r = probe<Array<number>>();
_at(r).call(r, 0);