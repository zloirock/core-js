type A<T> = { b: { c: T } };
declare const a: A<string>;
a.b.c.at(-1);
