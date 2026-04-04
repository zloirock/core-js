declare const obj: { count: number };
type T = typeof obj.count;
const x: T = 42;
x.toFixed(2);
