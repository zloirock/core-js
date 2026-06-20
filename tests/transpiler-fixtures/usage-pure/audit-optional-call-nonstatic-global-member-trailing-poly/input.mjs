// optional CALL on a NON-static member of a polyfillable global, followed by a polyfilled
// instance method: the `?.` guards the (undefined) member, not the always-defined global, so it
// must SURVIVE the rewrite. native short-circuits the whole chain to undefined; dropping the `?.`
// would invoke a non-existent static and throw
const r = Promise.noSuchStatic?.().includes(0);
r;
