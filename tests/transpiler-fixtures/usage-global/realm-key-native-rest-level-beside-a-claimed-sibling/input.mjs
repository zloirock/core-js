// A claimed sibling's own route rewrites the declaration in place and leaves a realm key the plan keeps
// native - a rest under a key the build does not resolve - as the declaration's sole hop. The plan made of
// the pattern before that rewrite is retired, so the sibling's binding lands once, a default on the level
// or none.
const { Foo: { bar, ...rest }, Set: S } = globalThis;
const { Deno: { env, ...others } = {}, Symbol: Sym } = globalThis;
use(bar, rest, S, env, others, Sym);
