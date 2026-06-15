// statics that return their first argument unchanged (Object.freeze / seal / setPrototypeOf, etc.)
// keep the argument's container type, so a method call on the frozen-constant binding substitutes the
// array-specific receiver-less helper. Object.fromEntries returns a NEW plain object (no such flag),
// so a read on its result stays native. two array-narrow methods so each import is distinct.
const FROZEN = Object.freeze(["a", "b"]);
FROZEN.includes("a");
const SEALED = Object.seal([1, 2]);
SEALED.at(0);
const ENTRIES = Object.fromEntries([["k", 1]]);
ENTRIES.includes(1);
