function spread<T>(x: T): [string, ...T[]] { return [x.toString(), x]; }
spread('hello').at(-1).toFixed(2);
