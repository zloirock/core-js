// Call returning mapped-passthrough  -  `probe<{data: number[]}>()` returns `Copy<T>`.
// Direct method call on the result: `probe<...>().data.at(0)`  -  does it resolve through Copy<T>?
type Copy<T> = { [K in keyof T]: T[K] };
declare function probe<T>(arg: T): Copy<T>;
probe<{ data: number[] }>(null!).data.at(0);
