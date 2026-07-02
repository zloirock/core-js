type A = { b: { c: string[] } };

declare const a: A;

a.b.c.at(-1);
