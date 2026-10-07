// A key naming both an instance method and a static of the right's constructor: a `||` / `??` left read
// off the realm of a global the build does not serve - directly, under another realm name, through an
// alias or a destructured binding - leaves the right live, and that arm takes the static's own entry,
// beside a sibling static too.
const { concat } = globalThis.WeakRef || Iterator;
const { entries } = globalThis.FinalizationRegistry ?? Object;
const { split } = self.WeakRef || Symbol;
const Ref = globalThis.WeakRef;
const { values } = Ref || Object;
const { FinalizationRegistry: Registry } = globalThis;
const { match } = Registry ?? Symbol;
const { matchAll, for: forKey } = globalThis.WeakRef || Symbol;
export { concat, entries, split, values, match, matchAll, forKey };
