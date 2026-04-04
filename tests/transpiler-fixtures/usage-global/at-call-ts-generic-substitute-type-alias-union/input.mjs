type MaybeArray<T> = Array<T> | null;
function wrap<T>(x: T): MaybeArray<T> { return [x]; }
wrap('hello').at(-1).toFixed(2);
