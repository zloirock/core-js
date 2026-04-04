type MyArray<T> = Array<T>;
function wrap<T>(x: T): MyArray<T> { return [x]; }
wrap('hello').at(-1).toFixed(2);
