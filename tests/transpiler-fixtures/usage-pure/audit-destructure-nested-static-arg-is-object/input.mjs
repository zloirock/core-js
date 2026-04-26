// destructure nested inside a static-method call whose arg is an object literal: the
// rewrite must thread through the literal arg without breaking the destructure.
const { Object: { freeze, keys } } = globalThis;
keys(freeze({ a: 1 }));
