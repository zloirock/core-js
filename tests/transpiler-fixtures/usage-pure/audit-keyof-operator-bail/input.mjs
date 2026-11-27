// A keyof argument leaves the array receiver unchanged.
type Shape = { a: string; b: number };
declare const k: keyof Shape;
const arr: string[] = ['x'];
arr.at(k as any);
