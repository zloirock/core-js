// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const clean = { k: Object } as { k: typeof Object };
const { k: { keys } } = clean;
const written = { k: Object } as { k: unknown };
(written as { k: unknown }).k = Map;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
const { k: { groupBy } } = written;
const tuple = [Object] as const;
const { 0: { entries } } = tuple;
const typedOnly = [Object];
type TypedRead = typeof typedOnly.reverse;
const { 0: { getOwnPropertyNames } } = typedOnly;
const asserted = [Object, Map] as [typeof Object, typeof Map];
asserted!.reverse();
const { 0: { getOwnPropertyDescriptor } } = asserted;
export type { TypedRead };
export { keys, groupBy, entries, getOwnPropertyNames, getOwnPropertyDescriptor };
