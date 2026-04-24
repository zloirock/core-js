// trivial mapped passthrough `{ [K in keyof T]: T[K] }` - type resolves through to T.
// expect Array-specific polyfill since T=string[]
type Copy<T> = { [K in keyof T]: T[K] };
declare const a: Copy<string[]>;
a.at(0);
a.includes('foo');
