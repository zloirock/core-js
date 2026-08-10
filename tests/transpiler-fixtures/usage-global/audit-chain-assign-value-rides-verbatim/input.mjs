// a collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what
// the value's own render copied from the source rides along with it. two things follow, and each row
// asserts one of them: a polyfillable read left inside that copied text still owns its rewrite, and
// the source between the value and the end of the assignment - where a parenthesized value keeps its
// closing token - comes back too, or the file stops parsing.
// the two emitters do NOT agree on how to spell a proxy navigation sitting in the assigned value -
// one prints the leaf's own ponyfill, the other collapses the redundant hop to the root, and the
// import sets differ accordingly. that disagreement is OPEN, not settled here: these rows assert
// what rides along with the value, and the recorded outputs pin today's spelling on each side
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

// the claim needs the value to BE the global, not merely to be rooted at one: a step onto anything
// else leaves a value the source dereferences and throws on, so the member stays where it was
export const nonGlobalSlot = (q = globalThis.noSuchSlot).Map.name;
export const nonGlobalObject = (q = globalThis.Math).Map.name;
export const nonGlobalUnderHop = (q = (arr.at(0), globalThis).noSuchSlot).Map.name;
