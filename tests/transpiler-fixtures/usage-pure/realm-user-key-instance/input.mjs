// User keys on a realm can contain instances; they do not name built-in namespaces.
// Dispatch uses each runtime value once and preserves defaults and optional receiver spelling.
// Prefixes may sit in the receiver, its member read or ahead of its default guard, once.
const { Data: { at } } = globalThis;
let includes;
({ data: { includes } } = globalThis);
const { Data: { flat = /* method default */ fallback() } } = (/* receiver prefix */ touch(), globalThis);
const { Data: { findLast }, sibling } = globalThis;
const { Data: { map = fallback() } } = globalThis;
const { Data: { filter } } = globalThis?.self;
const [{ self: { Data: { flatMap } = fallback() } }] = [globalThis];
const { Data: { join } = fallback() } = globalThis?.self;
const { data: { findLastIndex } } = globalThis || {};
const { Data: { toReversed } } = true ? globalThis : {};
const { data: { toSorted } } = (touch(), globalThis) ?? {};
const { Data: { toSpliced } } = (touch(), globalThis || {});
const realm = globalThis;
const { data: { find } } = realm;
for (const { Data: { findIndex } } of [globalThis]) consume(findIndex);
// A known namespace keeps the symbol key and its live default.
let iterator;
({ Object: { [Symbol.iterator]: iterator = null } } = globalThis);
export { at, includes, flat, findLast, sibling, map, filter, find, iterator };
