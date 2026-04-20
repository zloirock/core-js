// three-level alias chain through two mapped passthroughs. typeParamMap threading
// must survive both hops: Outer<T> -> Middle<T> (mapped) -> Inner<T> (mapped) -> T
type Inner<T> = { [K in keyof T]: T[K] };
type Middle<T> = Inner<T>;
type Outer<T> = { [K in keyof Middle<T>]: Middle<T>[K] };
declare const a: Outer<string[]>;
a.at(0);
