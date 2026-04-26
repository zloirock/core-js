// TS `!` non-null between optional accesses `x?.a!.b`: the wrapper is peeled for the
// chain rewrite to recognise the receiver shape.
arr?.at(-1)!.includes("x");
