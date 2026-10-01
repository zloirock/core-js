// nested Awaited around nested Promise; final inner type drives member narrowing
type T = Awaited<Awaited<Promise<Promise<number[]>>>>;
declare const x: T;
x.includes(1);
x.at(0);
