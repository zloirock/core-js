// A rest parameter default over a constructor whose constructor entry the build excludes: each claimed static
// loads its own module whatever spells the receiver - plain, realm member, alias - and a selection reading it off
// the realm decides for that left, the data subset carrying the constructor, so its fallback loads nothing, in a
// function handed out as well.
const N = Number;
function plain({ groupBy, ...rest } = Map) { return [groupBy, rest]; }
function realm({ allSettled, ...rest } = globalThis.Promise) { return [allSettled, rest]; }
function alias({ isInteger, ...rest } = N) { return [isInteger, rest]; }
function either({ from, ...rest } = globalThis.Iterator || Set) { return [from, rest]; }
function nullish({ escape, ...rest } = globalThis.RegExp ?? WeakMap) { return [escape, rest]; }
function escaping({ canParse, ...rest } = globalThis.URL || WeakSet) { return [canParse, rest]; }
use(plain(), realm(), alias(), either(), nullish(), escaping);
