// Pick<T, K> with multi-key K narrowing - K is union of literal strings.
// The named-type resolver maps Pick to STRUCTURE_PRESERVING_WRAPPERS, returning
// the resolved inner T (full T regardless of K). Probe whether picked
// member access still narrows when K limits keys but the inner shape is
// still queried by member name. Documented precision limit per CLAUDE.md.
type Source = { items: number[]; tags: string[]; meta: { ok: boolean } };
type Picked = Pick<Source, 'items' | 'tags'>;
declare const v: Picked;
v.items.at(0);
v.tags.findLast(s => true);
