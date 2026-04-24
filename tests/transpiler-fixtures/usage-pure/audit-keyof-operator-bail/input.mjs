// keyof T on a type alias - plugin explicitly returns null (not-supported branch).
// Should not crash; receiver unknown => generic polyfill.
type Shape = { a: string; b: number };
declare const k: keyof Shape;
const arr: string[] = ['x'];
arr.at(k as any);
