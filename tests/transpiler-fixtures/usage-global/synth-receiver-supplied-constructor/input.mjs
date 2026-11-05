// A supplied global constructor is read independently of the shadowed parameter default.
(({ from } = Array, Array) => from([1, 2]))(globalThis.Array);
