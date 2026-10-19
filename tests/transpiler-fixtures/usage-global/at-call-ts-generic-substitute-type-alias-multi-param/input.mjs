type Wrapper<X, Y> = Array<Y>;
function wrap<T>(x: T): Wrapper<number, T> { return [x]; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
wrap('hello').at(-1).toFixed(2);
