// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs EXACTLY with the
// literal init element at the same index - but every static element from the spread on is still a POSSIBLE slot value, and
// inject-if-might is sound here: a member read off the alias injects the union's method-aware set as a MAYBE.
let tail = globalThis.tail;
// arms recurse through NESTED unions; a sequence candidate resolves through its tail; the
// assignment-form destructure pairs the same way the declarator form does
const [, { Uint8Array: U8 }] = [...tail, deep ? (deeper ? globalThis : self) : window];
export const viaNestedUnionArms = U8.fromBase64;
let AB;
([, { DOMException: AB }] = [...tail, globalThis]);
