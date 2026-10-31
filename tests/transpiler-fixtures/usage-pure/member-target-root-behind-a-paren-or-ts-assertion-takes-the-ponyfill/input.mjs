// A paren or a TS assertion around the root of a member target, or around an object on its chain, spells the
// same slot: the target takes the ponyfill like its bare twin, a computed sole chain included.
let sink = {}, deep = { a: {} }, alt: any = {};
// @ts-expect-error dynamic JS adds a member the declared type lacks
({ from: (sink).f } = Array);
// @ts-expect-error dynamic JS adds a member the declared type lacks
({ of: ((deep.a)).f } = Array);
({ fromAsync: (alt as any).g } = Array);
({ Set: alt![k()] } = globalThis);
({ Map: (alt satisfies object).m } = globalThis);
