interface MyList<T> extends Array<T> {}
function wrap<T>(x: T): MyList<T> { return [x] as MyList<T>; }
wrap('hello').at(-1).toFixed(2);
