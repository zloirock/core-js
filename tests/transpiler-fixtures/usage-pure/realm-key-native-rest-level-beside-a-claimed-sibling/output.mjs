import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
// A claimed sibling's own route rewrites the declaration in place and leaves a realm key the plan keeps
// native - a rest under a key the build does not resolve - as the declaration's sole hop. The plan made of
// the pattern before that rewrite is retired, so the sibling's binding lands once, a default on the level
// or none.
const S = _Set;
const {
  Foo: {
    bar,
    ...rest
  }
} = _globalThis;
const Sym = _Symbol;
const {
  Deno: {
    env,
    ...others
  } = {}
} = _globalThis;
use(bar, rest, S, env, others, Sym);