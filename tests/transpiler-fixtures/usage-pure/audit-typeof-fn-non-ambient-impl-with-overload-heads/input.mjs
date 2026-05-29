// A non-ambient `function fn` implementation preceded by `function fn` overload heads.
// ReturnType<typeof fn> resolves against the LAST declared head (`(x: number): number[]`),
// not the implementation's `any` return, so r is number[] and `.at(0)` narrows to the Array
// variant.
function fn(x: string): string;
function fn(x: number): number[];
function fn(x: any): any { return null as any; }
const r: ReturnType<typeof fn> = fn(0);
r.at(0);
