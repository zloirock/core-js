// User keys on a realm can contain instances; they do not name built-in namespaces.
// Instance imports cover values reached through defaults, aliases and optional receivers.
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
export { at, includes, flat, findLast, sibling, map, filter, find };
