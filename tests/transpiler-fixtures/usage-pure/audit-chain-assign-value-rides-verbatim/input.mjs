// a collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what
// the value's own render copied from the source rides along with it. two things follow, and each row
// asserts one of them: a polyfillable read left inside that copied text still owns its rewrite, and
// the source between the value and the end of the assignment - where a parenthesized value keeps its
// closing token - comes back too, or the file stops parsing.
// both emitters spell the assigned value by ONE rule, the guarded twin's canon: a fully
// ponyfilled navigation spells as the LEAF's own ponyfill (`q = _self`), a realm hop READ THROUGH
// that leaf folds onto it, mid-chain writes survive the
// collapse, and a SEQUENCE-rooted navigation stays root-substituted verbatim (its prefix owns
// live inner rewrites no rebuilt span could carry); the import sets match either way
let q;
const arr = [1];

// the value's sequence prefix is copied verbatim, so the calls in it stay polyfilled
export const prefixInstance = (q = (arr.at(0), globalThis).self.window).Map.name;
export const prefixStatic = (q = (Promise.resolve(1), globalThis).self).Map.name;
export const prefixUnderHop = (q = (arr.at(0), globalThis)).self.Map.name;

// a PARENTHESIZED value: the closing token lives past the value's end
export const parenValue = (q = (globalThis.self)).Map.name;
export const parenValueWithPrefix = (q = (arr.at(0), globalThis.self)).Map.name;
export const parenValueNested = (q = ((globalThis.self))).Map.name;

// negatives: an unparenthesized value has nothing past its end, and a ctor static reached the same
// way keeps the whole shape too
export const bareValue = (q = globalThis.self).Map.name;
export const ctorStatic = (q = (arr.at(0), globalThis).self).Number.MAX_SAFE_INTEGER;

// an unresolvable TAIL hop collapses to the deepest ponyfillable hop and rides the tail read
// raw off it; mid-chain writes survive beside the outer one
export const bareUnresolvableTail = (q = globalThis.self.window).Map.name;
let w;
export const nestedWriteTail = (q = (w = globalThis.self.window)).Map.name;

// a static VALUE claim consumes the receiver hops above the assignment, leaving the `=` buried
// under them - the collapse must dig it out the same way the effect prelude does, or the value
// keeps a raw hop only in this claim shape while the ctor-read rows above collapse it
export const tailStaticRead = (q = globalThis.self.window).Number.MAX_SAFE_INTEGER;
export const tailStaticCall = (q = (Promise.resolve(2), globalThis).self.window).Array.of(7);
export const tailFallback = (q = globalThis.self.window).Promise.noSuchStatic;

// an unresolvable hop BELOW the collapse point keeps its guard - the value the source computes can
// be undefined, and an unguarded leaf would report the global where native short-circuits or throws.
// the sequence prefix rides INSIDE the test with its own polyfills alive, an alias root keeps its name
export const nestedBelowValue = (q = globalThis.window.self).Map.name;
export const nestedBelowSeq = (q = (arr.at(0), globalThis).window.self).Map.name;
const alias = globalThis;
export const nestedBelowAliasSeq = (q = (arr.at(0), alias).window.self).Map.name;

// the claim needs the value to BE the global, not merely to be rooted at one: a step onto anything
// else leaves a value the source dereferences and throws on, so the member stays where it was
export const nonGlobalSlot = (q = globalThis.noSuchSlot).Map.name;
export const nonGlobalObject = (q = globalThis.Math).Map.name;
export const nonGlobalUnderHop = (q = (arr.at(0), globalThis).noSuchSlot).Map.name;
