type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
declare const x: MyReadonly<{ items: number[] }>;
x.items.at(0);
