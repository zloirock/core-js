// A paren or a TS assertion around the root of a member target, or around an object on its chain, spells the
// same slot: the target takes the ponyfill like its bare twin, a computed sole chain included.
let sink = {}, deep = { a: {} }, alt: any = {};
({ from: (sink).f } = Array);
({ of: ((deep.a)).f } = Array);
({ fromAsync: (alt as any).g } = Array);
({ Set: alt![k()] } = globalThis);
({ Map: (alt satisfies object).m } = globalThis);
