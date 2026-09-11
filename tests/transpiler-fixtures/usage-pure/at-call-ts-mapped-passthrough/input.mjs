type Copy<T> = { [K in keyof T]: T[K] };
declare const x: Copy<{ items: number[] }>;
x.items.at(0);
