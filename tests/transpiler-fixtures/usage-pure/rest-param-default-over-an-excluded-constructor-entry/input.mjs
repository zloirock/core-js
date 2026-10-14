// A rest parameter default over a constructor whose constructor entry the build excludes has no whole index to
// take: its claimed static extracts into the body, as over a constructor with no entry, whatever spells the
// receiver - plain, realm member, alias - and a selection reading it off the realm decides for that left, the data
// subset carrying `Promise`, so its fallback leaves with its import. A function handed out keeps its default
// native, the body extraction's caller boundary.
const P = Promise;
function plain({ try: attempt, ...rest } = Promise) { return [attempt, rest]; }
function realm({ allSettled, ...rest } = globalThis.Promise) { return [allSettled, rest]; }
function alias({ any, ...rest } = P) { return [any, rest]; }
function either({ withResolvers, ...rest } = globalThis.Promise || Set) { return [withResolvers, rest]; }
function nullish({ race, ...rest } = globalThis.Promise ?? Map) { return [race, rest]; }
function escaping({ reject, ...rest } = globalThis.Promise || WeakSet) { return [reject, rest]; }
use(plain(), realm(), alias(), either(), nullish(), escaping);
