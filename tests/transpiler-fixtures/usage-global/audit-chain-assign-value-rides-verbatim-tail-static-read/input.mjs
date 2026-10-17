// A collapse that keeps a chain assignment re-emits the assignment around a REBUILT value, and what the value's own render copied
// from the source rides along with it.
let q;
// a static VALUE claim consumes the receiver hops above the assignment, leaving the `=` buried
// under them - the collapse must dig it out the same way the effect prelude does, or the value
// keeps a raw hop only in this claim shape while the ctor-read rows above collapse it
export const tailStaticRead = (q = globalThis.self.window).Number.MAX_SAFE_INTEGER;
