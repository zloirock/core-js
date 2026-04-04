type TaggedArray<T> = Array<T> & { tag: string };
function wrap<T>(x: T): TaggedArray<T> { return Object.assign([x], { tag: 'test' }) as TaggedArray<T>; }
wrap('hello').at(-1).toFixed(2);
