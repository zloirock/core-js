// negative case: IIFE that isn't an identity pass-through -- `(arg => globalThis)(Array)`
// has a body Identifier `globalThis` that DOESN'T match any param name. zero-arg IIFE peel
// rejects (no param matches the body's Identifier), the args don't get lifted, the call
// stays opaque. `Result`'s type is unknown, `{ from } = Result` can't pin a constructor,
// per-branch enumeration bails correctly -- no over-emission of Array.from.
const Result = (arg => globalThis)(Array);
const { from } = Result;
from([1, 2]);
