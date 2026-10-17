// a receiver whose type is statically known and holds no variant of the method must get nothing at
// all in pure - injecting the type-agnostic entry there would emit a helper that cannot apply on
// any arm. the knowledge arrives on carriers that do not look alike: a cross-family union narrows
// to a hint SET and leaves the concrete slot empty, a receiver named after its constructor carries
// the type in the name's own case, and a single annotated type folds to the concrete slot. all
// three sit at the end of an optional chain, the position where a stray injection also rewrites
// the guard around them. distinct method per line so each carrier is attributable
declare const union: Date | RegExp;
union?.at(0);
Date.prototype?.includes(1);
declare const folded: Date;
folded?.flatMap(f);