// init has a call inside a composite literal — must be treated as side-effectful
const { from } = { get from() { log(); return Array.from; } };
