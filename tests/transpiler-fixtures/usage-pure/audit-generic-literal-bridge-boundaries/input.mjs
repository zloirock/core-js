// A forwarded field keeps the actual argument family when its structural type is ambiguous.
type Wrap<T> = { v: T; };
declare const n: number;
function w<T = number[]>(x: T): Wrap<T> { return { v: x } as any; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
w({ a: 1 }).v.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
w(() => 1).v.includes(1);
w(`a${n}b`).v.at(0);
w<string>('abc' as any).v.includes('c');
function ws<T = string>(x: T): Wrap<T> { return { v: x } as any; }
ws([new Date()]).v.at(0);
