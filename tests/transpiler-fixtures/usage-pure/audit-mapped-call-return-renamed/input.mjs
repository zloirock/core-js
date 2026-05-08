// Mapped passthrough with DIFFERENT type-param names: probe<U>(...) returning Copy<U>.
// Inner Copy uses T, outer probe uses U  -  no name collision in substMap.
type Copy<T> = { [K in keyof T]: T[K] };
declare function probe<U>(arg: U): Copy<U>;
const r = probe<{ data: number[] }>(null!);
r.data.at(0);
