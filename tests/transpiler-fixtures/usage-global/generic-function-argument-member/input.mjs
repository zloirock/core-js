type Wrap<T> = { v: T; };
function w<T = number[]>(x: T): Wrap<T> { return { v: x } as any; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
w(() => 1).v.includes(1);
