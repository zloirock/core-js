type TaggedArray<T> = Array<T> & { tag: string };
function wrap<T>(x: T): TaggedArray<T> { return Object.assign([x], { tag: 'test' }) as TaggedArray<T>; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
wrap('hello').at(-1).toFixed(2);
