// A native-constructor alias written through an UNCONDITIONAL sequence-expression statement (`(0, ({ Array: A } = globalThis))`)
// is trusted, so its static member read folds.
let A;
(0, ({ Array: A } = globalThis));
