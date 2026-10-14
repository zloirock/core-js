// A paren around the root of a member target, or around an object on its chain, spells the same slot in the
// JS dialect too: the target takes the ponyfill like its bare twin, a computed sole chain included.
const sink = {}, deep = { a: {} };
({ from: (sink).f } = Array);
({ of: ((deep.a)).f } = Array);
({ Set: (sink)[k()] } = globalThis);
