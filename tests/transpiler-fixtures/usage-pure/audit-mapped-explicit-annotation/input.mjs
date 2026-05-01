// Explicit annotation with mapped-passthrough type — should resolve T into the body's T[K]
type Copy<T> = { [K in keyof T]: T[K] };
declare const r: Copy<{ data: number[] }>;
r.data.at(0);
