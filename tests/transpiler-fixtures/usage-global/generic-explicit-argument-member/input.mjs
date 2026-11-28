type Wrap<T> = { v: T; };
function w<T = number[]>(x: T): Wrap<T> { return { v: x } as any; }
w<string>('abc' as any).v.includes('c');
