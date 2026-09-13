// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
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

// A plain terminal navigation hop folds onto the deepest backed leaf when consumed.
// Mid-chain stores retain their assignment order.
export const bareUnresolvableTail = (q = globalThis.self.window).Map.name;
let w;
export const nestedWriteTail = (q = (w = globalThis.self.window)).Map.name;

// a static VALUE claim consumes the receiver hops above the assignment, leaving the `=` buried
// under them - the collapse must dig it out the same way the effect prelude does, or the value
// keeps a raw hop only in this claim shape while the ctor-read rows above collapse it
export const tailStaticRead = (q = globalThis.self.window).Number.MAX_SAFE_INTEGER;
export const tailStaticCall = (q = (Promise.resolve(2), globalThis).self.window).Array.of(7);
export const tailFallback = (q = globalThis.self.window).Promise.noSuchStatic;

// A plain middle navigation hop reaches the backed leaf without inventing an optional guard.
// Sequence effects remain inside the stored value, and direct and aliased roots agree.
export const nestedBelowValue = (q = globalThis.window.self).Map.name;
export const nestedBelowSeq = (q = (arr.at(0), globalThis).window.self).Map.name;
const alias = globalThis;
export const nestedBelowAliasSeq = (q = (arr.at(0), alias).window.self).Map.name;

// the claim needs the value to BE the global, not merely to be rooted at one: a step onto anything
// else leaves a value the source dereferences and throws on, so the member stays where it was
export const nonGlobalSlot = (q = globalThis.noSuchSlot).Map.name;
export const nonGlobalObject = (q = globalThis.Math).Map.name;
export const nonGlobalUnderHop = (q = (arr.at(0), globalThis).noSuchSlot).Map.name;
