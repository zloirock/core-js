function spread<T>(x: T): [string, ...T[]] { return [x.toString(), x]; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
spread('hello').at(-1).toFixed(2);
