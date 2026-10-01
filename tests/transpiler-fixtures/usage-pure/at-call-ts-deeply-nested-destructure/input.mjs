declare const data: { a: { b: { c: { d: number[] } } } };
const { a: { b: { c: { d } } } } = data;
d.at(-1);
